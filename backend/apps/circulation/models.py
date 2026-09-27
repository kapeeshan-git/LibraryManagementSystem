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


class CirculationRule(models.Model):
    """
    Koha-style Circulation & Fine Rules Matrix (smart-rules.pl).
    Rules govern checkout limits, loan durations, renewal limits,
    grace periods, and overdue fine rates based on Patron Category x Item Type.
    """
    class PatronCategory(models.TextChoices):
        STUDENT = 'STUDENT', _('Student')
        LECTURER = 'LECTURER', _('Lecturer / Academic Staff')
        LIBRARIAN = 'LIBRARIAN', _('Librarian')
        ADMIN = 'ADMIN', _('Administrator')
        ALL = '*', _('All Patron Categories (*)')

    class ItemCategory(models.TextChoices):
        STANDARD = 'STANDARD', _('Standard Lending Book')
        REFERENCE = 'REFERENCE', _('Reference (Non-circulating)')
        RESERVE = 'RESERVE', _('Course Reserve (Short Loan)')
        PERIODICAL = 'PERIODICAL', _('Periodical / Journal')
        ALL = '*', _('All Item Types (*)')

    patron_category = models.CharField(
        max_length=20,
        choices=PatronCategory.choices,
        default=PatronCategory.ALL,
        help_text=_("Koha Patron Category Code or wildcard (*)")
    )
    item_type = models.CharField(
        max_length=20,
        choices=ItemCategory.choices,
        default=ItemCategory.ALL,
        help_text=_("Koha Item Type / Collection Code or wildcard (*)")
    )
    max_checkouts = models.PositiveIntegerField(
        default=2,
        help_text=_("Maximum simultaneous book checkouts allowed")
    )
    loan_period_days = models.PositiveIntegerField(
        default=14,
        help_text=_("Standard loan duration in days")
    )
    fine_per_day_rs = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=10.00,
        help_text=_("Overdue fine rate per day in LKR")
    )
    grace_period_days = models.PositiveIntegerField(
        default=1,
        help_text=_("Grace period in days before fine applies")
    )
    max_renewals = models.PositiveIntegerField(
        default=1,
        help_text=_("Maximum number of loan renewals allowed")
    )
    holds_allowed = models.BooleanField(
        default=True,
        help_text=_("Whether holds/reserves can be placed on this item")
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        help_text=_("Human-readable rule description")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('patron_category', 'item_type')
        ordering = ['patron_category', 'item_type']

    def __str__(self):
        return f"Rule: {self.patron_category} x {self.item_type} ({self.loan_period_days} days, max {self.max_checkouts})"
