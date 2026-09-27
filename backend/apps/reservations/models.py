from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.catalog.models import Book, BookCopy

class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Waiting in Queue')
        READY_FOR_PICKUP = 'READY_FOR_PICKUP', _('Ready for Desk Pickup')
        COMPLETED = 'COMPLETED', _('Fulfilled / Checked Out')
        EXPIRED = 'EXPIRED', _('Expired (Not Picked Up)')
        CANCELLED = 'CANCELLED', _('Cancelled by User or Staff')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    allocated_copy = models.ForeignKey(
        BookCopy,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='active_holds'
    )
    queue_position = models.PositiveIntegerField(
        default=1,
        help_text=_("Position in waiting queue (1 = first in line)")
    )
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    reserved_at = models.DateTimeField(auto_now_add=True)
    hold_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Pickup window deadline (typically 24-48 hours after readiness)")
    )

    class Meta:
        ordering = ['queue_position', 'reserved_at']

    @property
    def is_hold_expired(self):
        if self.status == self.Status.READY_FOR_PICKUP and self.hold_expires_at:
            return timezone.now() > self.hold_expires_at
        return False

    def __str__(self):
        return f"{self.user.reg_number} - {self.book.title} [{self.get_status_display()}]"
