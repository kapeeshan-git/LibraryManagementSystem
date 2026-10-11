from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Waiting in Queue')
        READY_FOR_PICKUP = 'READY_FOR_PICKUP', _('Ready for Desk Pickup')
        COMPLETED = 'COMPLETED', _('Fulfilled / Checked Out')
        EXPIRED = 'EXPIRED', _('Expired (Not Picked Up)')
        CANCELLED = 'CANCELLED', _('Cancelled by User or Staff')

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    # Decoupled from catalog - store IDs and cached data
    book_id = models.IntegerField(db_index=True, help_text=_("Book ID from Catalog Service"))
    book_title = models.CharField(max_length=255, blank=True, help_text=_("Cached book title"))
    book_isbn = models.CharField(max_length=30, blank=True, help_text=_("Cached ISBN"))
    allocated_copy_id = models.IntegerField(null=True, blank=True, help_text=_("BookCopy ID from Catalog Service"))
    allocated_copy_accession = models.CharField(max_length=100, blank=True, help_text=_("Cached accession number"))
    queue_position = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.PENDING, db_index=True)
    reserved_at = models.DateTimeField(auto_now_add=True)
    hold_expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['queue_position', 'reserved_at']

    @property
    def is_hold_expired(self):
        if self.status == self.Status.READY_FOR_PICKUP and self.hold_expires_at:
            return timezone.now() > self.hold_expires_at
        return False

    def __str__(self):
        return f"{self.user.reg_number} - {self.book_title} [{self.get_status_display()}]"
