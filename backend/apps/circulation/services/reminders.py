"""Reminder scan (guide 8.5). Safe to re-run: every email has a dedupe key."""
from datetime import timedelta

from apps.core import clock

from ..models import Loan

LOOKAHEAD = timedelta(days=7)


def stage_for(loan, now):
    hours_left = (loan.due_at - now).total_seconds() / 3600
    if hours_left <= 0:
        return "overdue"
    if hours_left <= loan.final_reminder_hours:
        return "final"
    if hours_left <= loan.reminder_hours:
        return "due"
    return None


def scan_reminders():
    from apps.notifications.models import Notification
    from apps.notifications.services import queue_email

    now = clock.now()
    candidates = []
    for loan in Loan.objects.filter(
        status=Loan.Status.ACTIVE, due_at__lte=now + LOOKAHEAD
    ).select_related("patron"):
        stage = stage_for(loan, now)
        if stage:
            key = f"due_reminder:{loan.id}:{clock.local(loan.due_at).date().isoformat()}:{stage}"
            candidates.append((key, stage, loan))
    existing = set(
        Notification.objects.filter(
            dedupe_key__in=[c[0] for c in candidates]
        ).values_list("dedupe_key", flat=True)
    )
    queued = 0
    for key, stage, loan in candidates:
        if key in existing:
            continue
        ctx = {
            "name": loan.patron.full_name,
            "title": loan.title_snapshot,
            "accession": loan.accession_snapshot,
            "due": clock.local(loan.due_at).strftime("%a %d %b %Y, %I:%M %p"),
        }
        if queue_email(
            loan.patron,
            f"loan_{stage}",
            ctx,
            dedupe_key=key,
            related=("loan", loan.id),
        ):
            queued += 1
    return queued
