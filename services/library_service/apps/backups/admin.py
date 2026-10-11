from django.contrib import admin
from .models import BackupConfig, BackupRecord

@admin.register(BackupConfig)
class BackupConfigAdmin(admin.ModelAdmin):
    list_display = ['service_name', 'auto_backup_enabled', 'backup_frequency', 'backup_time', 'retention_days']

@admin.register(BackupRecord)
class BackupRecordAdmin(admin.ModelAdmin):
    list_display = ['service_name', 'backup_type', 'status', 'file_name', 'started_at']
    list_filter = ['service_name', 'status', 'backup_type']
