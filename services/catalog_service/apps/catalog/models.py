from django.db import models
from django.utils.translation import gettext_lazy as _

class Category(models.Model):
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=50, blank=True, help_text=_("e.g. DDC 004 or CS-100"))
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}" if self.code else self.name


class Author(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    biography = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=255, db_index=True)
    isbn = models.CharField(max_length=30, unique=True, db_index=True)
    authors = models.ManyToManyField(Author, related_name='books')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books')
    publisher = models.CharField(max_length=200, blank=True)
    publication_year = models.PositiveIntegerField(null=True, blank=True)
    edition = models.CharField(max_length=50, blank=True)
    shelf_location = models.CharField(max_length=100, blank=True, help_text=_("e.g., Rack A-12, Shelf 3"))
    call_number = models.CharField(max_length=100, blank=True, help_text=_("Koha / DDC Classification Call Number (e.g., 005.133 JAV 2023)"))
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='book_covers/', null=True, blank=True)
    search_count = models.PositiveIntegerField(default=0, db_index=True, help_text=_("Total number of catalog searches and detail views for this book"))
    borrow_count = models.PositiveIntegerField(default=0, db_index=True, help_text=_("Total cumulative times physical copies of this book were checked out"))
    hold_count = models.PositiveIntegerField(default=0, db_index=True, help_text=_("Total cumulative hold and reservation requests placed for this book"))
    custom_fields = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    @property
    def total_copies_count(self):
        # Use len() to utilize prefetch_related cache in memory without hitting the DB
        return len(self.copies.all())

    @property
    def available_copies_count(self):
        # Use list comprehension to utilize prefetch_related cache in memory
        return len([c for c in self.copies.all() if c.status == BookCopy.Status.AVAILABLE])

    def __str__(self):
        return f"{self.title} (ISBN: {self.isbn})"


class BookCopy(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', _('Available for Loan')
        BORROWED = 'BORROWED', _('Checked Out')
        ON_HOLD = 'ON_HOLD', _('Reserved for Pickup')
        LOST = 'LOST', _('Reported Lost')
        MAINTENANCE = 'MAINTENANCE', _('In Repair / Maintenance')

    class Condition(models.TextChoices):
        NEW = 'NEW', _('Brand New')
        GOOD = 'GOOD', _('Good')
        FAIR = 'FAIR', _('Fair / Used')
        DAMAGED = 'DAMAGED', _('Damaged')

    class ItemType(models.TextChoices):
        STANDARD = 'STANDARD', _('Standard Lending Book')
        REFERENCE = 'REFERENCE', _('Reference (Non-circulating)')
        RESERVE = 'RESERVE', _('Course Reserve (Short Loan)')
        PERIODICAL = 'PERIODICAL', _('Periodical / Journal')

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='copies')
    accession_number = models.CharField(max_length=100, unique=True, db_index=True, help_text=_("Unique library barcode or accession number for this physical copy"))
    item_type = models.CharField(max_length=20, choices=ItemType.choices, default=ItemType.STANDARD, db_index=True, help_text=_("Koha Item Type / Collection Code"))
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE, db_index=True)
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.GOOD)
    acquisition_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Book Copies"
        ordering = ['accession_number']

    def __str__(self):
        return f"{self.book.title} [Copy: {self.accession_number}] ({self.get_status_display()})"

