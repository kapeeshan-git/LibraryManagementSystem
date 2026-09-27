from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from apps.circulation.models import BorrowRecord
from apps.fines.models import Fine
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Processes active overdue loans, calculates daily overdue fines, and sends notifications.'

    def handle(self, *args, **options):
        now = timezone.now()
        overdue_records = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.ACTIVE,
            due_date__lt=now
        ).select_related('user', 'book_copy__book')

        processed_count = 0
        total_fines_accrued = 0.0

        for record in overdue_records:
            delta_days = max(1, (now.date() - record.due_date.date()).days)
            computed_fine = delta_days * settings.FINE_PER_DAY_RS

            fine, created = Fine.objects.get_or_create(
                borrow_record=record,
                user=record.user,
                defaults={
                    'amount': computed_fine,
                    'status': Fine.Status.UNPAID,
                    'reason': f"Overdue loan for '{record.book_copy.book.title}' ({delta_days} day(s))"
                }
            )

            if not created:
                if fine.amount != computed_fine:
                    fine.amount = computed_fine
                    fine.update_status()
                    fine.save()

            # Record overdue status on record if not marked
            record.status = BorrowRecord.Status.OVERDUE
            record.save(update_fields=['status'])

            total_fines_accrued += float(computed_fine)
            processed_count += 1

            # Dispatch notification if day 1, 3, or 7
            if delta_days in [1, 3, 7, 14]:
                Notification.objects.create(
                    user=record.user,
                    title="Overdue Book Reminder",
                    message=f"'{record.book_copy.book.title}' is {delta_days} days overdue. Current fine balance is Rs. {computed_fine:.2f}. Please return it immediately.",
                    notification_type=Notification.NotificationType.OVERDUE_ALERT
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully processed {processed_count} overdue records. Total calculated fines: Rs. {total_fines_accrued:.2f}"
            )
        )
