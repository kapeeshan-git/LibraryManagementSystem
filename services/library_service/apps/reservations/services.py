from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.exceptions import ValidationError
from apps.circulation.models import BorrowRecord
from apps.notifications.models import Notification
from .models import Reservation
from clients import catalog_client

class ReservationService:
    @staticmethod
    def create_reservation(user, book_id):
        # Fetch book details from Catalog Service
        book_data = catalog_client.get_book_details(book_id)
        if not book_data:
            raise ValidationError("Book not found.")

        book_title = book_data.get('title', '')
        book_isbn = book_data.get('isbn', '')

        existing_res = Reservation.objects.filter(
            user=user, book_id=book_id,
            status__in=[Reservation.Status.PENDING, Reservation.Status.READY_FOR_PICKUP]
        ).exists()
        if existing_res:
            raise ValidationError("You already have an active hold or queue position for this book.")

        has_active_loan = BorrowRecord.objects.filter(
            user=user, book_id=book_id, status=BorrowRecord.Status.ACTIVE
        ).exists()
        if has_active_loan:
            raise ValidationError("You currently have a copy of this book checked out.")

        # Check availability from Catalog Service
        avail_data = catalog_client.get_copy_availability(book_id)
        now = timezone.now()

        if avail_data and avail_data.get('first_available_copy'):
            available_copy = avail_data['first_available_copy']
            expires_at = now + timedelta(hours=settings.HOLD_EXPIRY_HOURS)
            # Update copy status in Catalog Service
            catalog_client.update_copy_status(available_copy['id'], 'ON_HOLD')

            reservation = Reservation.objects.create(
                user=user, book_id=book_id, book_title=book_title, book_isbn=book_isbn,
                allocated_copy_id=available_copy['id'],
                allocated_copy_accession=available_copy.get('accession_number', ''),
                queue_position=1, status=Reservation.Status.READY_FOR_PICKUP,
                hold_expires_at=expires_at
            )
            Notification.objects.create(
                user=user, title="Book Hold Confirmed",
                message=f"A copy of '{book_title}' has been held for you at the library desk until {expires_at.strftime('%Y-%m-%d %H:%M')}.",
                notification_type=Notification.NotificationType.HOLD_READY
            )
        else:
            pending_count = Reservation.objects.filter(
                book_id=book_id, status=Reservation.Status.PENDING
            ).count()
            reservation = Reservation.objects.create(
                user=user, book_id=book_id, book_title=book_title, book_isbn=book_isbn,
                queue_position=pending_count + 1, status=Reservation.Status.PENDING
            )
            Notification.objects.create(
                user=user, title="Added to Reservation Queue",
                message=f"You are #{reservation.queue_position} in line for '{book_title}'.",
                notification_type=Notification.NotificationType.GENERAL
            )

        catalog_client.increment_book_stat(book_id, 'hold_count')
        return reservation

    @staticmethod
    def cancel_reservation(user, reservation_id):
        try:
            reservation = Reservation.objects.get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValidationError("Reservation not found.")
        if not user.is_admin_or_librarian and reservation.user != user:
            raise ValidationError("You do not have permission to cancel this reservation.")
        if reservation.status not in [Reservation.Status.PENDING, Reservation.Status.READY_FOR_PICKUP]:
            raise ValidationError(f"Cannot cancel a reservation that is already {reservation.get_status_display().lower()}.")

        old_copy_id = reservation.allocated_copy_id
        reservation.status = Reservation.Status.CANCELLED
        reservation.save()

        if old_copy_id:
            next_in_queue = Reservation.objects.filter(
                book_id=reservation.book_id, status=Reservation.Status.PENDING
            ).order_by('queue_position', 'reserved_at').first()

            if next_in_queue:
                now = timezone.now()
                next_in_queue.allocated_copy_id = old_copy_id
                next_in_queue.allocated_copy_accession = reservation.allocated_copy_accession
                next_in_queue.status = Reservation.Status.READY_FOR_PICKUP
                next_in_queue.hold_expires_at = now + timedelta(hours=settings.HOLD_EXPIRY_HOURS)
                next_in_queue.save()
                Notification.objects.create(
                    user=next_in_queue.user, title="Reserved Book Ready for Pickup",
                    message=f"'{reservation.book_title}' is now ready for you at the library desk.",
                    notification_type=Notification.NotificationType.HOLD_READY
                )
            else:
                catalog_client.update_copy_status(old_copy_id, 'AVAILABLE')

        return reservation
