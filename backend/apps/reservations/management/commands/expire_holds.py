from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from apps.reservations.models import Reservation
from apps.catalog.models import BookCopy
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Expires uncollected desk hold reservations after 48 hours and re-allocates to next patron in queue.'

    def handle(self, *args, **options):
        now = timezone.now()
        expired_holds = Reservation.objects.filter(
            status=Reservation.Status.READY_FOR_PICKUP,
            hold_expires_at__lt=now
        ).select_related('book', 'allocated_copy', 'user')

        expired_count = 0
        reallocated_count = 0

        for hold in expired_holds:
            copy = hold.allocated_copy
            hold.status = Reservation.Status.EXPIRED
            hold.save()

            Notification.objects.create(
                user=hold.user,
                title="Reservation Hold Expired",
                message=f"Your hold pickup window for '{hold.book.title}' has expired without collection. The copy has been released.",
                notification_type=Notification.NotificationType.HOLD_EXPIRED
            )
            expired_count += 1

            if copy:
                # Find next in queue
                next_in_line = Reservation.objects.filter(
                    book=hold.book,
                    status=Reservation.Status.PENDING
                ).order_by('queue_position', 'reserved_at').first()

                if next_in_line:
                    next_in_line.allocated_copy = copy
                    next_in_line.status = Reservation.Status.READY_FOR_PICKUP
                    next_in_line.hold_expires_at = now + timedelta(hours=settings.HOLD_EXPIRY_HOURS)
                    next_in_line.save()

                    Notification.objects.create(
                        user=next_in_line.user,
                        title="Reserved Book Ready for Pickup",
                        message=f"'{hold.book.title}' is now ready for pickup at the library desk. Collect before {next_in_line.hold_expires_at.strftime('%Y-%m-%d %H:%M')}.",
                        notification_type=Notification.NotificationType.HOLD_READY
                    )
                    reallocated_count += 1
                else:
                    copy.status = BookCopy.Status.AVAILABLE
                    copy.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Expired {expired_count} uncollected holds. Re-allocated {reallocated_count} to next patrons in line."
            )
        )
