from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class Department(models.Model):
    name = models.CharField(max_length=150, unique=True)
    faculty = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['faculty', 'name']
    def __str__(self):
        return f"{self.name} ({self.faculty})"

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError(_('The Registration/Staff ID must be set as username'))
        if email:
            email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('System Administrator')
        LIBRARIAN = 'LIBRARIAN', _('Librarian')
        LECTURER = 'LECTURER', _('Lecturer / Academic Staff')
        STUDENT = 'STUDENT', _('Student')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT, db_index=True)
    reg_number = models.CharField(max_length=50, unique=True, help_text=_("Student Reg No or Staff ID"))
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='patrons')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_active_patron = models.BooleanField(default=True, help_text=_("Allows revoking library borrowing privileges without deactivating login"))
    debarment_reason = models.CharField(max_length=255, blank=True, help_text=_("Koha patron debarment / restriction reason"))
    staff_notes = models.TextField(blank=True, help_text=_("Internal library staff notes on this patron"))
    custom_fields = models.JSONField(default=dict, blank=True)
    objects = CustomUserManager()
    def save(self, *args, **kwargs):
        if not self.username and self.reg_number:
            self.username = self.reg_number
        elif self.username and not self.reg_number:
            self.reg_number = self.username
        super().save(*args, **kwargs)
    @property
    def is_admin_or_librarian(self):
        return self.role in [self.Role.ADMIN, self.Role.LIBRARIAN] or self.is_superuser
    @property
    def is_academic_staff(self):
        return self.role == self.Role.LECTURER
    def __str__(self):
        return f"{self.reg_number} - {self.get_full_name() or self.username} ({self.get_role_display()})"

class CustomFieldDefinition(models.Model):
    ENTITY_CHOICES = (
        ('USER', 'User'),
        ('BOOK', 'Book'),
    )
    FIELD_TYPE_CHOICES = (
        ('TEXT', 'Text'),
        ('NUMBER', 'Number'),
        ('DATE', 'Date'),
        ('BOOLEAN', 'Boolean'),
        ('DROPDOWN', 'Dropdown'),
    )
    entity_type = models.CharField(max_length=10, choices=ENTITY_CHOICES, default='USER')
    name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default='TEXT')
    options = models.JSONField(default=list, blank=True)
    is_required = models.BooleanField(default=False)

    class Meta:
        unique_together = ('entity_type', 'name')

    def __str__(self):
        return f"{self.entity_type} - {self.name} ({self.field_type})"
