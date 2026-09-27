from django.db import models
from django.conf import settings
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

    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='research_papers'
    )
    title = models.CharField(max_length=300, db_index=True)
    authors_display = models.CharField(
        max_length=400,
        help_text=_("Citation author string (e.g. Dr. K. Silva, Prof. J. Perera)")
    )
    abstract = models.TextField()
    keywords = models.CharField(max_length=255, blank=True, help_text=_("Comma separated keywords"))
    doi = models.CharField(max_length=150, blank=True, null=True, help_text=_("Digital Object Identifier (if assigned)"))
    journal_or_conference = models.CharField(max_length=255, blank=True)
    publication_date = models.DateField(null=True, blank=True)
    
    file = models.FileField(
        upload_to='research_papers/%Y/%m/',
        help_text=_("PDF document of research paper")
    )
    access_type = models.CharField(
        max_length=20,
        choices=AccessType.choices,
        default=AccessType.OPEN_ACCESS
    )
    status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        db_index=True
    )
    
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_papers'
    )
    review_comments = models.TextField(blank=True)
    download_count = models.PositiveIntegerField(default=0)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.title} - {self.lecturer.get_full_name() or self.lecturer.username} [{self.get_status_display()}]"
