from django.urls import path
from .views import (
    BackupConfigView, BackupRecordListView, TriggerBackupView,
    DownloadBackupView, DeleteBackupView, BackupStatsView
)

urlpatterns = [
    path('config/', BackupConfigView.as_view(), name='backup-config'),
    path('records/', BackupRecordListView.as_view(), name='backup-records'),
    path('trigger/', TriggerBackupView.as_view(), name='backup-trigger'),
    path('download/<int:pk>/', DownloadBackupView.as_view(), name='backup-download'),
    path('delete/<int:pk>/', DeleteBackupView.as_view(), name='backup-delete'),
    path('stats/', BackupStatsView.as_view(), name='backup-stats'),
]
