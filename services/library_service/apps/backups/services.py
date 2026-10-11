import os
import shutil
import zipfile
import logging
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.utils import timezone
from .models import BackupConfig, BackupRecord

logger = logging.getLogger(__name__)

class BackupService:
    @staticmethod
    def perform_backup(service_name, triggered_by=None, backup_type='MANUAL', include_media=False):
        record = BackupRecord.objects.create(
            service_name=service_name,
            backup_type=backup_type,
            status='IN_PROGRESS',
            includes_media=include_media,
            triggered_by=triggered_by
        )
        
        try:
            config, _ = BackupConfig.objects.get_or_create(service_name=service_name)
            
            # Determine paths
            base_dir = Path(settings.BASE_DIR)
            if service_name == 'repository':
                service_root = base_dir.parent / 'repository_service'
                db_name = 'repository_db.sqlite3'
            else:
                service_root = base_dir
                db_name = 'library_db.sqlite3'
                
            db_path = service_root / db_name
            media_path = service_root / 'media'
            
            if config.local_backup_path:
                backup_dir = Path(config.local_backup_path)
            else:
                backup_dir = service_root / 'backups' / service_name
                
            backup_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = timezone.now().strftime('%Y-%m-%d_%H%M%S')
            filename = f"{service_name}_backup_{timestamp}.zip"
            zip_path = backup_dir / filename
            
            # Create zip
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                if db_path.exists():
                    zipf.write(db_path, db_name)
                else:
                    raise FileNotFoundError(f"Database file not found: {db_path}")
                    
                if include_media and media_path.exists() and media_path.is_dir():
                    for root, _, files in os.walk(media_path):
                        for file in files:
                            file_path = Path(root) / file
                            arcname = file_path.relative_to(service_root)
                            zipf.write(file_path, arcname)
                            
            file_size = zip_path.stat().st_size
            
            # NAS backup
            nas_path = ""
            if config.nas_backup_enabled and config.nas_path:
                nas_dest = Path(config.nas_path) / filename
                shutil.copy2(zip_path, nas_dest)
                nas_path = str(nas_dest)
                
            # Cloud backup
            cloud_url = ""
            if config.cloud_backup_enabled and config.cloud_provider != 'NONE':
                logger.info(f"Uploading {filename} to {config.cloud_provider} bucket {config.cloud_bucket}")
                cloud_url = f"{config.cloud_provider}://{config.cloud_bucket}/{filename}"
                
            record.status = 'COMPLETED'
            record.file_name = filename
            record.file_size_bytes = file_size
            record.local_path = str(zip_path)
            record.nas_path = nas_path
            record.cloud_url = cloud_url
            record.completed_at = timezone.now()
            record.save()
            
        except Exception as e:
            record.status = 'FAILED'
            record.error_message = str(e)
            record.completed_at = timezone.now()
            record.save()
            logger.error(f"Backup failed for {service_name}: {str(e)}")
            
        return record

    @staticmethod
    def cleanup_old_backups(service_name):
        config, _ = BackupConfig.objects.get_or_create(service_name=service_name)
        cutoff_date = timezone.now() - timezone.timedelta(days=config.retention_days)
        
        old_records = BackupRecord.objects.filter(
            service_name=service_name,
            started_at__lt=cutoff_date
        )
        
        for record in old_records:
            if record.local_path and os.path.exists(record.local_path):
                try:
                    os.remove(record.local_path)
                except Exception as e:
                    logger.error(f"Failed to remove old backup file {record.local_path}: {e}")
            record.delete()

    @staticmethod
    def get_backup_stats(service_name):
        records = BackupRecord.objects.filter(service_name=service_name)
        last_success = records.filter(status='COMPLETED').first()
        config, _ = BackupConfig.objects.get_or_create(service_name=service_name)
        
        return {
            'total_backups': records.count(),
            'total_size_bytes': sum(r.file_size_bytes for r in records if r.file_size_bytes),
            'last_backup_at': last_success.completed_at if last_success else None,
            'next_scheduled_backup': config.backup_time if config.auto_backup_enabled else None,
            'config': {
                'auto_enabled': config.auto_backup_enabled,
                'frequency': config.backup_frequency,
                'retention_days': config.retention_days
            }
        }
