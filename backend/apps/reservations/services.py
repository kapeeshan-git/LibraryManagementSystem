from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.exceptions import ValidationError
from django.db import models
from apps.catalog.models import Book, BookCopy
from apps.circulation.models import BorrowRecord
from apps.notifications.models import Notification
from .models import Reservation

class ReservationService:
    @staticmethod
    def create_reservation(user, book_id):
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            raise ValidationError("Book not found.")

        # Check existing active reservations
        existing_res = Reservation.objects.filter(
            user=user,
            book=book,
            status__in=[Reservation.Status.PENDING, Reservation.Status.READY_FOR_PICKUP]
        ).exists()
        if existing_res:
            raise ValidationError("You already have an active hold or queue position for this book.")

        # Check if patron currently has this book on loan
        has_active_loan = BorrowRecord.objects.filter(
            user=user,
            book_copy__book=book,
            status=BorrowRecord.Status.ACTIVE
        ).exists()
        if has_active_loan:
            raise ValidationError("You currently have a copy of this book checked out.")

        # Check if an available copy can be held immediately
        available_copy = BookCopy.objects.filter(
            book=book,
            status=BookCopy.Status.AVAILABLE
        ).first()

        now = timezone.now()

        if available_copy:
            # Immediate 48-hour desk hold
            expires_at = now + timedelta(hours=settings.HOLD_EXPIRY_HOURS)
            available_copy.status = BookCopy.Status.ON_HOLD
            available_copy.save()

            reservation = Reservation.objects.create(
                user=user,
                book=book,
                allocated_copy=available_copy,
                queue_position=1,
                status=Reservation.Status.READY_FOR_PICKUP,
                hold_expires_at=expires_at
            )

            Notification.objects.create(
                user=user,
                title="Book Hold Confirmed",
                message=f"A copy of '{book.title}' has been held for you at the library desk until {expires_at.strftime('%Y-%m-%d %H:%M')}.",
                notification_type=Notification.NotificationType.HOLD_READY
            )
        else:
            # Enqueue in FIFO waitlist
            pending_count = Reservation.objects.filter(
                book=book,
                status=Reservation.Status.PENDING
            ).count()

            reservation = Reservation.objects.create(
                user=user,
                book=book,
                queue_position=pending_count + 1,
                status=Reservation.Status.PENDING
            )

            Notification.objects.create(
                user=user,
                title="Added to Reservation Queue",
                message=f"You are #{reservation.queue_position} in line for '{book.title}'. You will be notified once a copy is returned.",
                notification_type=Notification.NotificationType.GENERAL
            )

        # Update cumulative hold / reservation count on book
        Book.objects.filter(pk=book.id).update(hold_count=models.F('hold_count') + 1)

        return reservation

    @staticmethod
    def cancel_reservation(user, reservation_id):
        try:
            reservation = Reservation.objects.select_related('book', 'allocated_copy').get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValidationError("Reservation not found.")

        # Check permissions
        if not user.is_admin_or_librarian and reservation.user != user:
            raise ValidationError("You do not have permission to cancel this reservation.")

        if reservation.status not in [Reservation.Status.PENDING, Reservation.Status.READY_FOR_PICKUP]:
            raise ValidationError(f"Cannot cancel a reservation that is already {reservation.get_status_display().lower()}.")

        old_allocated_copy = reservation.allocated_copy
        reservation.status = Reservation.Status.CANCELLED
        reservation.save()

        # If a copy was on hold for this reservation, reallocate or free it
        if old_allocated_copy:
            next_in_queue = Reservation.objects.filter(
                book=reservation.book,
                status=Reservation.Status.PENDING
            ).order_by('queue_position', 'reserved_at').first()

            if next_in_queue:
                now = timezone.now()
                next_in_queue.allocated_copy = old_allocated_copy
                next_in_queue.status = Reservation.Status.READY_FOR_PICKUP
                next_in_queue.hold_expires_at = now + timedelta(hours=settings.HOLD_EXPIRY_HOURS)
                next_in_queue.save()

                Notification.objects.create(
                    user=next_in_queue.user,
                    title="Reserved Book Ready for Pickup",
                    message=f"'{reservation.book.title}' is now ready for you at the library desk. Collect before {next_in_queue.hold_expires_at.strftime('%Y-%m-%d %H:%M')}.",
                    notification_type=Notification.NotificationType.HOLD_READY
                )
            else:
                old_allocated_copy.status = BookCopy.Status.AVAILABLE
                old_allocated_copy.save()

        return reservation
