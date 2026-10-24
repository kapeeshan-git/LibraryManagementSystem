"""Issue / return / renew / lost (guide 8.2-8.4, 9.5). Lock order is always patron -> copy -> loan."""
import random
import time

from django.conf import settings
from django.db import IntegrityError, OperationalError, transaction
from django.db.models import Sum

from apps.accounts.models import User
from apps.audit.services import log as audit_log
from apps.catalog.models import Book, BookCopy, Collection, SectionPolicy
from apps.core import clock
from apps.core.errors import ApiError

from ..models import Fine, Loan
from .calendar import compute_due_at, compute_fine
from .rules import find_rule

MYSQL_RETRYABLE = (1213, 1205)  # deadlock victim, lock wait timeout


def with_deadlock_retry(fn, attempts=3):
    for i in range(attempts):
        try:
            return fn()
        except OperationalError as e:
            code = e.args[0] if e.args else None
            if code not in MYSQL_RETRYABLE or i == attempts - 1:
                raise
            time.sleep(0.05 * (2**i) + random.random() * 0.05)


def copy_not_available(accession, status):
    return ApiError(
        "COPY_NOT_AVAILABLE",
        f"Copy {accession} is not available ({status}).",
        409,
    )


def _lock_patron(patron_id):
    patron = User.objects.select_for_update().filter(pk=patron_id).first()
    if patron is None:
        raise ApiError("PATRON_NOT_FOUND", "Patron not found.", 404)
    return patron


def _copy_id_for(accession):
    copy_id = (
        BookCopy.objects.filter(accession_number=accession)
        .values_list("id", flat=True)
        .first()
    )
    if copy_id is None:
        raise ApiError(
            "COPY_NOT_FOUND",
            f"No copy with accession number {accession}.",
            404,
        )
    return copy_id


def _fine_balance(patron_id):
    return (
        Fine.objects.filter(patron_id=patron_id, status=Fine.Status.OPEN).aggregate(
            s=Sum("balance")
        )["s"]
        or 0
    )


# --- issue ---


def issue_copy(*, librarian, patron_id, accession_number):
    return with_deadlock_retry(
        lambda: _issue(librarian, patron_id, accession_number.strip())
    )


@transaction.atomic
def _issue(librarian, patron_id, accession):
    copy_id = _copy_id_for(accession)
    patron = _lock_patron(patron_id)  # lock 1
    copy = BookCopy.objects.select_for_update().get(pk=copy_id)  # lock 2 (copy row only)
    if copy.status != BookCopy.Status.AVAILABLE:
        raise copy_not_available(accession, copy.status)
    collection = Collection.objects.select_related("section").get(
        pk=copy.collection_id
    )
    section = collection.section
    if section is None:
        raise ApiError(
            "COPY_NOT_BORROWABLE",
            f"{collection.name} copies are for in-library use only.",
            422,
        )
    if patron.status != User.Status.ACTIVE or not patron.is_active:
        raise ApiError(
            "PATRON_INACTIVE", f"Patron is {patron.status}.", 422
        )

    now = clock.now()
    rule = find_rule(patron, section.code, clock.local(now).date())
    if rule is None or not rule.is_allowed:
        raise ApiError(
            "NO_CIRCULATION_RULE",
            f"This patron may not borrow {section.code} books.",
            422,
        )
    if settings.ENFORCE_ISSUE_HOURS and not (
        section.issue_start <= clock.local(now).time() <= section.issue_end
    ):
        raise ApiError(
            "OUTSIDE_ISSUE_HOURS",
            f"{section.code} books are issued {section.issue_start:%H:%M}-{section.issue_end:%H:%M}.",
            422,
        )
    active = Loan.objects.filter(
        patron=patron,
        status=Loan.Status.ACTIVE,
        section_snapshot=section.code,
    ).count()
    if active >= rule.max_loans:
        raise ApiError(
            "LOAN_LIMIT_REACHED",
            f"Patron has reached the limit of {rule.max_loans} {section.code} loans.",
            422,
        )
    threshold = settings.BLOCK_ISSUE_IF_FINE_BALANCE_OVER
    if threshold is not None and _fine_balance(patron.id) > threshold:
        raise ApiError(
            "FINES_BLOCK_BORROWING",
            "Unpaid fines are over the limit. Please settle them first.",
            422,
        )

    book = Book.objects.get(pk=copy.book_id)
    try:
        with transaction.atomic():
            loan = Loan.objects.create(
                patron=patron,
                copy=copy,
                issued_by=librarian,
                issued_at=now,
                due_at=compute_due_at(
                    now, rule.loan_period_days, section.return_end
                ),
                title_snapshot=book.title[:500],
                accession_snapshot=copy.accession_number,
                section_snapshot=section.code,
                reminder_hours=rule.reminder_hours_before,
                final_reminder_hours=rule.final_reminder_hours_before,
            )
    except IntegrityError:
        raise copy_not_available(accession, BookCopy.Status.ON_LOAN)
    copy.status = BookCopy.Status.ON_LOAN
    copy.version += 1
    copy.save(update_fields=["status", "version"])
    audit_log(
        librarian,
        "loan.issue",
        "loan",
        loan.id,
        metadata={
            "patron_id": patron.id,
            "accession": accession,
            "due_at": loan.due_at.isoformat(),
        },
    )
    return loan


# --- return ---


def return_copy(*, librarian, accession_number):
    return with_deadlock_retry(
        lambda: _return(librarian, accession_number.strip())
    )


@transaction.atomic
def _return(librarian, accession):
    from apps.notifications.services import queue_email

    copy_id = _copy_id_for(accession)
    ref = (
        Loan.objects.filter(copy_id=copy_id, status=Loan.Status.ACTIVE)
        .values("id", "patron_id")
        .first()
    )
    if ref is None:
        raise ApiError(
            "LOAN_NOT_ACTIVE", f"Copy {accession} is not on loan.", 409
        )
    patron = _lock_patron(ref["patron_id"])  # lock 1
    copy = BookCopy.objects.select_for_update().get(pk=copy_id)  # lock 2
    loan = Loan.objects.select_for_update().get(pk=ref["id"])  # lock 3
    if loan.status != Loan.Status.ACTIVE:
        raise ApiError(
            "LOAN_NOT_ACTIVE", f"Copy {accession} is not on loan.", 409
        )

    now = clock.now()
    loan.returned_at = now
    loan.status = Loan.Status.RETURNED
    loan.save(update_fields=["returned_at", "status"])

    fine = None
    section = SectionPolicy.objects.filter(pk=loan.section_snapshot).first()
    rate = section.fine_per_day if section else 0
    days, amount = compute_fine(loan.due_at, now, rate)
    if days > 0 and amount > 0:
        fine = Fine.objects.create(
            loan=loan,
            patron=patron,
            days_late=days,
            rate_applied=rate,
            calculated_amount=amount,
            balance=amount,
            created_at=now,
        )
        queue_email(
            patron,
            "fine_created",
            {
                "name": patron.full_name,
                "title": loan.title_snapshot,
                "days": days,
                "amount": f"{amount:.2f}",
            },
            dedupe_key=f"fine_created:{fine.id}",
            related=("fine", fine.id),
        )

    if copy.status == BookCopy.Status.ON_LOAN:
        copy.status = BookCopy.Status.AVAILABLE
        copy.version += 1
        copy.save(update_fields=["status", "version"])
    audit_log(
        librarian,
        "loan.return",
        "loan",
        loan.id,
        metadata={
            "accession": accession,
            "days_late": days,
            "fine": f"{amount:.2f}",
        },
    )
    return loan, fine


# --- renew ---


def renew_loan(*, actor, loan_id, reason=""):
    return with_deadlock_retry(lambda: _renew(actor, loan_id, reason))


@transaction.atomic
def _renew(actor, loan_id, reason):
    ref = Loan.objects.filter(pk=loan_id).values("patron_id").first()
    if ref is None or (
        actor.role == User.Role.MEMBER and ref["patron_id"] != actor.id
    ):
        raise ApiError("NOT_FOUND", "Loan not found.", 404)
    patron = _lock_patron(ref["patron_id"])
    loan = Loan.objects.select_for_update().get(pk=loan_id)
    if loan.status != Loan.Status.ACTIVE:
        raise ApiError("LOAN_NOT_ACTIVE", "This loan is not active.", 409)
    if patron.status != User.Status.ACTIVE:
        raise ApiError("PATRON_INACTIVE", f"Patron is {patron.status}.", 422)
    now = clock.now()
    override = False
    if loan.due_at < now:
        if actor.role == User.Role.MEMBER or not reason:
            raise ApiError(
                "LOAN_OVERDUE",
                "Overdue loans cannot be renewed. Please return the book.",
                422,
            )
        override = True
    rule = find_rule(
        patron, loan.section_snapshot, clock.local(now).date()
    )
    if rule is None or not rule.is_allowed:
        raise ApiError(
            "NO_CIRCULATION_RULE",
            "No circulation rule allows this renewal.",
            422,
        )
    if loan.renewal_count >= rule.max_renewals:
        raise ApiError(
            "RENEWAL_LIMIT_REACHED",
            f"Renewal limit ({rule.max_renewals}) reached.",
            422,
        )
    section = SectionPolicy.objects.get(pk=loan.section_snapshot)
    old_due = loan.due_at
    loan.due_at = max(
        old_due, compute_due_at(now, rule.loan_period_days, section.return_end)
    )
    loan.renewal_count += 1
    loan.save(update_fields=["due_at", "renewal_count"])
    audit_log(
        actor,
        "loan.renew",
        "loan",
        loan.id,
        reason=reason,
        metadata={
            "from": old_due.isoformat(),
            "to": loan.due_at.isoformat(),
            "override": override,
        },
    )
    return loan


# --- lost ---


@transaction.atomic
def declare_lost(*, actor, loan_id, reason=""):
    ref = Loan.objects.filter(pk=loan_id).values("patron_id", "copy_id").first()
    if ref is None:
        raise ApiError("NOT_FOUND", "Loan not found.", 404)
    _lock_patron(ref["patron_id"])
    copy = BookCopy.objects.select_for_update().get(pk=ref["copy_id"])
    loan = Loan.objects.select_for_update().get(pk=loan_id)
    if loan.status != Loan.Status.ACTIVE:
        raise ApiError("LOAN_NOT_ACTIVE", "This loan is not active.", 409)
    loan.status = Loan.Status.LOST
    loan.save(update_fields=["status"])
    copy.status = BookCopy.Status.LOST
    copy.version += 1
    copy.save(update_fields=["status", "version"])
    audit_log(actor, "loan.lost", "loan", loan.id, reason=reason)
    return loan
