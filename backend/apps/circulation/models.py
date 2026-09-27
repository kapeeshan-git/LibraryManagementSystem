from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.catalog.models import BookCopy

class BorrowRecord(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Currently Borrowed')
        RETURNED = 'RETURNED', _('Returned')
        OVERDUE = 'OVERDUE', _('Overdue')
        LOST = 'LOST', _('Lost / Unreturned')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='borrowings'
    )
    book_copy = models.ForeignKey(
        BookCopy,
        on_delete=models.PROTECT,
        related_name='borrow_history'
    )
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='issued_loans'
    )
    issue_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField()
    return_date = models.DateTimeField(null=True, blank=True)
    renewal_count = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-issue_date']

    @property
    def is_currently_overdue(self):
        if self.return_date:
            return False
        return timezone.now() > self.due_date

    @property
    def overdue_days(self):
        if not self.is_currently_overdue:
            return 0
        delta = timezone.now().date() - self.due_date.date()
        return max(0, delta.days)

    def __str__(self):
        return f"{self.user.reg_number} borrowed {self.book_copy.accession_number} (Due: {self.due_date.strftime('%Y-%m-%d')})"
