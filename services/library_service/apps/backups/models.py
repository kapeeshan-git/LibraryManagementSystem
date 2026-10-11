from django.db import models
from django.conf import settings

class BackupConfig(models.Model):
    FREQ_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly')
    ]
    CLOUD_CHOICES = [
        ('NONE', 'None'),
        ('AWS_S3', 'AWS S3'),
        ('GOOGLE_CLOUD', 'Google Cloud'),
        ('AZURE_BLOB', 'Azure Blob')
    ]

    service_name = models.CharField(max_length=50, unique=True)
    auto_backup_enabled = models.BooleanField(default=True)
    backup_frequency = models.CharField(max_length=20, choices=FREQ_CHOICES, default='DAILY')
    backup_time = models.TimeField(default='02:00:00')
    retention_days = models.PositiveIntegerField(default=30)
    
    local_backup_enabled = models.BooleanField(default=True)
    local_backup_path = models.CharField(max_length=500, blank=True)
    
    nas_backup_enabled = models.BooleanField(default=False)
    nas_path = models.CharField(max_length=500, blank=True)
    
    cloud_backup_enabled = models.BooleanField(default=False)
    cloud_provider = models.CharField(max_length=20, choices=CLOUD_CHOICES, default='NONE')
    cloud_bucket = models.CharField(max_length=200, blank=True)
    cloud_access_key = models.CharField(max_length=200, blank=True)
    cloud_secret_key = models.CharField(max_length=200, blank=True)
    cloud_region = models.CharField(max_length=50, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.service_name} config"

class BackupRecord(models.Model):
    TYPE_CHOICES = [
        ('MANUAL', 'Manual'),
        ('SCHEDULED', 'Scheduled')
    ]
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    ]

    service_name = models.CharField(max_length=50)
    backup_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    file_name = models.CharField(max_length=300)
    file_size_bytes = models.BigIntegerField(default=0)
    
    local_path = models.CharField(max_length=500, blank=True)
    nas_path = models.CharField(max_length=500, blank=True)
    cloud_url = models.CharField(max_length=500, blank=True)
    
    includes_media = models.BooleanField(default=False)
    includes_database = models.BooleanField(default=True)
    
    error_message = models.TextField(blank=True)
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    triggered_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    
    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.service_name} backup {self.started_at}"
