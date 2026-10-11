from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.backups.models import BackupConfig, BackupRecord
from apps.backups.services import BackupService

class Command(BaseCommand):
    help = 'Runs scheduled backups for configured services'

    def handle(self, *args, **options):
        now = timezone.now()
        configs = BackupConfig.objects.filter(auto_backup_enabled=True)
        
        for config in configs:
            # Check if current time matches backup_time within a 5-minute window
            # and no backup has been done today
            
            # Simple check if backup time is near
            current_time = now.time()
            backup_time = config.backup_time
            
            # calculate difference in minutes
            dt_current = timezone.timedelta(hours=current_time.hour, minutes=current_time.minute)
            dt_backup = timezone.timedelta(hours=backup_time.hour, minutes=backup_time.minute)
            diff = abs((dt_current - dt_backup).total_seconds()) / 60
            
            if diff <= 5:
                # check if already backed up today
                today = now.date()
                already_backed_up = BackupRecord.objects.filter(
                    service_name=config.service_name,
                    backup_type='SCHEDULED',
                    status='COMPLETED',
                    started_at__date=today
                ).exists()
                
                if not already_backed_up:
                    self.stdout.write(f"Starting scheduled backup for {config.service_name}...")
                    BackupService.perform_backup(
                        service_name=config.service_name,
                        backup_type='SCHEDULED',
                        include_media=True
                    )
                    self.stdout.write(f"Cleaning up old backups for {config.service_name}...")
                    BackupService.cleanup_old_backups(service_name=config.service_name)
                    self.stdout.write(self.style.SUCCESS(f"Successfully completed scheduled tasks for {config.service_name}"))
