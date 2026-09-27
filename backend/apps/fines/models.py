from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.circulation.models import BorrowRecord
import uuid

class Fine(models.Model):
    class Status(models.TextChoices):
        UNPAID = 'UNPAID', _('Unpaid')
        PARTIALLY_PAID = 'PARTIALLY_PAID', _('Partially Paid')
        PAID = 'PAID', _('Fully Paid')
        WAIVED = 'WAIVED', _('Waived / Excused')

    borrow_record = models.ForeignKey(
        BorrowRecord,
        on_delete=models.CASCADE,
        related_name='fines',
        null=True,
        blank=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='fines'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UNPAID,
        db_index=True
    )
    reason = models.CharField(max_length=255, default=_('Overdue book loan'))
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-calculated_at']

    @property
    def balance(self):
        return max(0.00, float(self.amount - self.paid_amount))

    def update_status(self):
        if self.paid_amount >= self.amount and self.amount > 0:
            self.status = self.Status.PAID
        elif self.paid_amount > 0:
            self.status = self.Status.PARTIALLY_PAID
        elif self.status != self.Status.WAIVED:
            self.status = self.Status.UNPAID

    def __str__(self):
        return f"Fine: Rs. {self.amount} for {self.user.reg_number} [{self.get_status_display()}]"


class PaymentReceipt(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', _('Cash Payment')
        ONLINE = 'ONLINE', _('Online Transfer / Gateway')
        WAIVED = 'WAIVED', _('Administrative Waiver')

    fine = models.ForeignKey(
        Fine,
        on_delete=models.CASCADE,
        related_name='receipts'
    )
    receipt_number = models.CharField(max_length=64, unique=True, db_index=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH
    )
    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='collected_payments'
    )
    paid_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = f"RCP-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.receipt_number} - Rs. {self.amount_paid}"
