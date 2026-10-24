"""Queue, claim and run jobs; render and send emails."""
import logging
import random
import smtplib
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError, connection, transaction

from apps.core import clock
from apps.core.models import SystemState

from .models import Job, Notification

log = logging.getLogger("lms.jobs")

SIGNATURE = "\n\nUniversity of Vavuniya Library"
TEMPLATES = {
    "loan_due": (
        "Reminder: '{title}' is due {due}",
        "Dear {name},\n\nThe book '{title}' ({accession}) is due back on {due}.\n"
        "You can renew it from 'My loans' if renewals are allowed.",
    ),
    "loan_final": (
        "Final reminder: '{title}' is due {due}",
        "Dear {name},\n\nThis is a final reminder: '{title}' ({accession}) is due back on {due}.\n"
        "Late returns are fined for each open day.",
    ),
    "loan_overdue": (
        "Overdue: '{title}' was due {due}",
        "Dear {name},\n\n'{title}' ({accession}) was due on {due} and is now overdue.\n"
        "Please return it as soon as possible. A fine applies for each open day.",
    ),
    "fine_created": (
        "Library fine: Rs {amount}",
        "Dear {name},\n\nA fine of Rs {amount} ({days} day(s) late) was recorded for '{title}'.\n"
        "Please pay at the circulation desk.",
    ),
    "password_reset": (
        "Reset your library password",
        "Dear {name},\n\nUse this link to set a new password (valid for a limited time):\n{link}\n\n"
        "If you did not ask for this, ignore this email.",
    ),
}
REDACTED_TEMPLATES = {"password_reset"}


class SmtpUnavailable(Exception):
    pass


def queue_email(user, template_id, context, *, dedupe_key, related=(None, None)):
    """Create Notification + send_email Job in the caller's transaction. Returns None if a duplicate."""
    subject_t, body_t = TEMPLATES[template_id]
    now = clock.now()
    try:
        with transaction.atomic():
            note = Notification.objects.create(
                user=user,
                template_id=template_id,
                dedupe_key=dedupe_key[:191],
                related_type=related[0] or "",
                related_id=related[1],
                subject=subject_t.format(**context)[:300],
                body=body_t.format(**context) + SIGNATURE,
                created_at=now,
            )
            Job.objects.create(
                type="send_email",
                payload={"notification_id": note.id},
                run_at=now,
            )
    except IntegrityError:
        return None
    return note


# --- handlers ---


def handle_send_email(payload):
    from apps.circulation.models import Loan

    note = (
        Notification.objects.select_related("user")
        .filter(pk=payload.get("notification_id"))
        .first()
    )
    if note is None or note.status in (
        Notification.Status.SENT,
        Notification.Status.CANCELLED,
    ):
        return
    if note.template_id.startswith("loan_") and note.related_id:
        if not Loan.objects.filter(
            pk=note.related_id, status=Loan.Status.ACTIVE
        ).exists():
            note.status = Notification.Status.CANCELLED
            note.save(update_fields=["status"])
            return
    if not note.user.email:
        note.status, note.error_category = (
            Notification.Status.FAILED,
            "NO_EMAIL",
        )
        note.save(update_fields=["status", "error_category"])
        return
    note.attempts += 1
    note.save(update_fields=["attempts"])
    if SystemState.get().smtp_down:
        raise SmtpUnavailable("SMTP server unavailable (simulated outage)")
    send_mail(
        note.subject,
        note.body,
        settings.DEFAULT_FROM_EMAIL,
        [note.user.email],
    )
    note.status, note.sent_at, note.error_category = (
        Notification.Status.SENT,
        clock.now(),
        "",
    )
    note.save(update_fields=["status", "sent_at", "error_category"])


HANDLERS = {"send_email": handle_send_email}


def _categorise(exc):
    if isinstance(
        exc,
        (
            SmtpUnavailable,
            smtplib.SMTPException,
            ConnectionError,
            TimeoutError,
            OSError,
        ),
    ):
        return "SMTP_UNAVAILABLE"
    return "HANDLER_ERROR"


def _on_failed(job):
    if job.type == "send_email":
        Notification.objects.filter(
            pk=job.payload.get("notification_id")
        ).exclude(status=Notification.Status.SENT).update(
            status=Notification.Status.FAILED,
            error_category=job.error_category,
        )


# --- queue mechanics ---


def claim_jobs(limit=10):
    now = clock.now()
    with transaction.atomic():
        jobs = list(
            Job.objects.select_for_update(skip_locked=True)
            .filter(status=Job.Status.PENDING, run_at__lte=now)
            .order_by("run_at", "id")[:limit]
        )
        Job.objects.filter(id__in=[j.id for j in jobs]).update(
            status=Job.Status.RUNNING, locked_at=now
        )
    return jobs


def run_job(job):
    handler = HANDLERS.get(job.type)
    try:
        if handler is None:
            raise ValueError(f"Unknown job type {job.type}")
        handler(job.payload)
    except Exception as exc:
        job.attempts += 1
        job.error_category = _categorise(exc)
        job.last_error = str(exc)[:500]
        if job.attempts >= settings.JOB_MAX_ATTEMPTS:
            job.status = Job.Status.FAILED
            _on_failed(job)
        else:
            delay = min(
                settings.JOB_BACKOFF_SECONDS * 2 ** (job.attempts - 1), 3600
            ) + random.uniform(0, 5)
            job.status, job.run_at = (
                Job.Status.PENDING,
                clock.now() + timedelta(seconds=delay),
            )
        job.locked_at = None
        job.save()
        log.warning(
            "Job %s (%s) failed: %s", job.id, job.type, job.error_category
        )
        return False
    job.attempts += 1
    job.status, job.locked_at, job.error_category, job.last_error = (
        Job.Status.DONE,
        None,
        "",
        "",
    )
    job.save()
    return True


def process_jobs(limit=20):
    jobs = claim_jobs(limit)
    for job in jobs:
        run_job(job)
    return len(jobs)


def reap_stale_jobs():
    cutoff = clock.now() - timedelta(minutes=settings.JOB_STALE_MINUTES)
    return Job.objects.filter(
        status=Job.Status.RUNNING, locked_at__lt=cutoff
    ).update(status=Job.Status.PENDING, locked_at=None)


def retry_job(job_id):
    with transaction.atomic():
        job = Job.objects.select_for_update().get(pk=job_id)
        if job.status in (Job.Status.DONE, Job.Status.RUNNING):
            return job, False
        job.status, job.attempts, job.run_at, job.locked_at = (
            Job.Status.PENDING,
            0,
            clock.now(),
            None,
        )
        job.save()
        if job.type == "send_email":
            Notification.objects.filter(
                pk=job.payload.get("notification_id"),
                status=Notification.Status.FAILED,
            ).update(status=Notification.Status.QUEUED, error_category="")
    return job, True


# --- single scheduler (MySQL named lock, guide 9.6) ---

SCHEDULER_LOCK = "lms_scheduler"


def hold_scheduler_lock():
    """True if this DB session holds the scheduler lock (acquires it if free)."""
    if connection.vendor != "mysql":
        return True
    with connection.cursor() as cur:
        cur.execute(
            "SELECT IS_USED_LOCK(%s) = CONNECTION_ID()", [SCHEDULER_LOCK]
        )
        if cur.fetchone()[0] == 1:
            return True
        cur.execute("SELECT GET_LOCK(%s, 0)", [SCHEDULER_LOCK])
        return cur.fetchone()[0] == 1


def scheduler_tick():
    from apps.circulation.services.reminders import scan_reminders

    queued = scan_reminders()
    reaped = reap_stale_jobs()
    SystemState.objects.filter(pk=1).update(
        scheduler_heartbeat=clock.real_now()
    ) or SystemState.objects.create(pk=1, scheduler_heartbeat=clock.real_now())
    return queued, reaped
