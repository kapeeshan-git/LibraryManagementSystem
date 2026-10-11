from django.db import models
from django.utils.translation import gettext_lazy as _

class ResearchPaper(models.Model):
    class AccessType(models.TextChoices):
        OPEN_ACCESS = 'OPEN_ACCESS', _('Open Access (Publicly Accessible)')
        CAMPUS_ONLY = 'CAMPUS_ONLY', _('Campus-Only (Restricted to University Patrons)')

    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending Librarian Review')
        APPROVED = 'APPROVED', _('Approved & Published')
        EDITS_REQUESTED = 'EDITS_REQUESTED', _('Revision / Edits Requested')
        REJECTED = 'REJECTED', _('Rejected')

    # Decoupled user references (no FK to User model)
    lecturer_id = models.IntegerField(db_index=True, help_text=_("User ID of the submitting lecturer"))
    lecturer_name = models.CharField(max_length=200, blank=True, help_text=_("Cached display name"))
    lecturer_reg_number = models.CharField(max_length=50, blank=True)
    lecturer_department = models.CharField(max_length=150, blank=True)

    title = models.CharField(max_length=300, db_index=True)
    authors_display = models.CharField(max_length=400, help_text=_("Citation author string"))
    abstract = models.TextField()
    keywords = models.CharField(max_length=255, blank=True, help_text=_("Comma separated keywords"))
    doi = models.CharField(max_length=150, blank=True, null=True, help_text=_("Digital Object Identifier"))
    journal_or_conference = models.CharField(max_length=255, blank=True)
    publication_date = models.DateField(null=True, blank=True)

    file = models.FileField(upload_to='research_papers/%Y/%m/', help_text=_("PDF document"))
    access_type = models.CharField(max_length=20, choices=AccessType.choices, default=AccessType.OPEN_ACCESS)
    status = models.CharField(max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING, db_index=True)

    reviewed_by_id = models.IntegerField(null=True, blank=True, help_text=_("User ID of reviewer"))
    reviewed_by_name = models.CharField(max_length=200, blank=True)
    review_comments = models.TextField(blank=True)
    download_count = models.PositiveIntegerField(default=0)

    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.title} - {self.lecturer_name} [{self.get_status_display()}]"

