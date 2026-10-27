"""Fine ledger and graduation clearance (guide 6.4, 9.x)."""
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Sum

from apps.accounts.models import User
from apps.audit.services import log as audit_log
from apps.core import clock
from apps.core.errors import ApiError, forbidden
from apps.core.http import get_choice, get_decimal, get_str

from ..models import Fine, FineTransaction, Loan


def open_balance(patron_id):
    return Fine.objects.filter(
        patron_id=patron_id, status=Fine.Status.OPEN
    ).aggregate(s=Sum("balance"))["s"] or Decimal("0.00")


@transaction.atomic
def record_fine_transaction(actor, fine_id, data):
    tx_type = get_choice(data, "type", FineTransaction.Type.values, required=True)
    amount = get_decimal(data, "amount", required=True)
    reason = get_str(data, "reason", max_len=500)
    receipt = get_str(data, "receipt_ref", max_len=100)

    fine = Fine.objects.select_for_update().filter(pk=fine_id).first()
    if fine is None:
        raise ApiError("NOT_FOUND", "Fine not found.", 404)
    if tx_type in (FineTransaction.Type.PAYMENT, FineTransaction.Type.WAIVER):
        if amount <= 0:
            raise ApiError(
                "VALIDATION_ERROR",
                "amount: Must be greater than zero.",
                400,
                {"amount": "Must be > 0."},
            )
        if amount > fine.balance:
            raise ApiError(
                "VALIDATION_ERROR",
                f"amount: Exceeds the balance of Rs {fine.balance:.2f}.",
                400,
                {"amount": "Exceeds balance."},
            )
    else:  # ADJUSTMENT (signed)
        if amount == 0 or fine.balance + amount < 0:
            raise ApiError(
                "VALIDATION_ERROR",
                "amount: Adjustment must be non-zero and keep the balance >= 0.",
                400,
                {"amount": "Invalid adjustment."},
            )
        if actor.role != User.Role.ADMIN:
            raise forbidden("Only an admin can make adjustments.")
    if tx_type != FineTransaction.Type.PAYMENT and not reason:
        raise ApiError(
            "VALIDATION_ERROR",
            "reason: Required for waivers and adjustments.",
            400,
            {"reason": "Required."},
        )
    if (
        tx_type == FineTransaction.Type.WAIVER
        and amount > settings.LARGE_WAIVER_LIMIT
        and actor.role != User.Role.ADMIN
    ):
        raise forbidden(
            f"Waivers above Rs {settings.LARGE_WAIVER_LIMIT} need an admin."
        )

    tx = FineTransaction.objects.create(
        fine=fine,
        type=tx_type,
        amount=amount,
        actor=actor,
        reason=reason,
        receipt_ref=receipt,
        created_at=clock.now(),
    )
    fine.balance += (
        amount if tx_type == FineTransaction.Type.ADJUSTMENT else -amount
    )
    fine.status = Fine.Status.SETTLED if fine.balance == 0 else Fine.Status.OPEN
    fine.save(update_fields=["balance", "status"])
    audit_log(
        actor,
        f"fine.{tx_type.lower()}",
        "fine",
        fine.id,
        reason=reason,
        metadata={
            "amount": f"{amount:.2f}",
            "balance": f"{fine.balance:.2f}",
            "transaction_id": tx.id,
        },
    )
    return fine


def check_clearance(patron):
    outstanding = Loan.objects.filter(
        patron=patron, status__in=[Loan.Status.ACTIVE, Loan.Status.LOST]
    )
    fines = Fine.objects.filter(patron=patron, status=Fine.Status.OPEN)
    balance = fines.aggregate(s=Sum("balance"))["s"] or Decimal("0.00")
    return {
        "cleared": not outstanding.exists() and balance == 0,
        "outstanding_loans": [
            {
                "id": l.id,
                "title": l.title_snapshot,
                "accession": l.accession_snapshot,
                "status": l.status,
                "due_at": l.due_at,
            }
            for l in outstanding
        ],
        "open_fines": [
            {"id": f.id, "balance": f.balance, "loan_id": f.loan_id}
            for f in fines
        ],
        "fine_balance": balance,
    }
