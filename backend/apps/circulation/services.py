from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from apps.catalog.models import BookCopy
from apps.reservations.models import Reservation
from apps.fines.models import Fine
from apps.notifications.models import Notification
from .models import BorrowRecord

User = get_user_model()

class CirculationService:
    @staticmethod
    def issue_book(librarian_user, patron_reg_number, accession_number, notes=''):
        # 1. Fetch and validate patron
        try:
            patron = User.objects.get(reg_number=patron_reg_number)
        except User.DoesNotExist:
            raise ValidationError(f"Patron with registration/ID '{patron_reg_number}' not found.")

        if not patron.is_active_patron or not patron.is_active:
            raise ValidationError("This patron's borrowing privileges are currently inactive or suspended.")

        # 2. Check active loans against role limits
        active_loans_count = BorrowRecord.objects.filter(user=patron, status=BorrowRecord.Status.ACTIVE).count()
        limit = settings.STUDENT_MAX_BOOKS if patron.role == User.Role.STUDENT else settings.LECTURER_MAX_BOOKS

        if active_loans_count >= limit:
            raise ValidationError(
                f"Patron has reached the maximum borrowing limit of {limit} book(s) for role {patron.get_role_display()}."
            )

        # 3. Check for overdue books block
        has_overdue = BorrowRecord.objects.filter(
            user=patron,
            status=BorrowRecord.Status.ACTIVE,
            due_date__lt=timezone.now()
        ).exists()
        if has_overdue:
            raise ValidationError("Patron has one or more overdue books. All overdue items must be cleared before new loans.")

        # 4. Fetch and validate book copy
        try:
            copy = BookCopy.objects.select_related('book').get(accession_number=accession_number)
        except BookCopy.DoesNotExist:
            raise ValidationError(f"Book copy with accession number/barcode '{accession_number}' not found.")

        # 5. Check copy status & reservation holds
        if copy.status == BookCopy.Status.ON_HOLD:
            # Check if held for THIS patron
            hold = Reservation.objects.filter(
                allocated_copy=copy,
                user=patron,
                status=Reservation.Status.READY_FOR_PICKUP
            ).first()
            if not hold:
                raise ValidationError("This physical copy is currently on hold for another patron at the pickup desk.")
            # Complete the reservation
            hold.status = Reservation.Status.COMPLETED
            hold.save()
        elif copy.status != BookCopy.Status.AVAILABLE:
            raise ValidationError(f"Book copy is not available for loan (Current status: {copy.get_status_display()}).")

        # 6. Calculate due date
        loan_days = settings.STUDENT_LOAN_DAYS if patron.role == User.Role.STUDENT else settings.LECTURER_LOAN_DAYS
        due_date = timezone.now() + timedelta(days=loan_days)

        # 7. Record transaction
        borrow_record = BorrowRecord.objects.create(
            user=patron,
            book_copy=copy,
            issued_by=librarian_user,
            issue_date=timezone.now(),
            due_date=due_date,
            status=BorrowRecord.Status.ACTIVE,
            notes=notes
        )

        copy.status = BookCopy.Status.BORROWED
        copy.save()

        # 8. Dispatch notification
        Notification.objects.create(
            user=patron,
            title="Book Issued Successfully",
            message=f"'{copy.book.title}' (Copy: {copy.accession_number}) has been issued. Due date is {due_date.strftime('%Y-%m-%d')}.",
            notification_type=Notification.NotificationType.DUE_REMINDER
        )

        return borrow_record

    @staticmethod
    def return_book(librarian_user, accession_number, condition=None, notes=''):
        try:
            copy = BookCopy.objects.select_related('book').get(accession_number=accession_number)
        except BookCopy.DoesNotExist:
            raise ValidationError(f"Book copy with accession number '{accession_number}' not found.")

        record = BorrowRecord.objects.filter(
            book_copy=copy,
            status=BorrowRecord.Status.ACTIVE
        ).order_by('-issue_date').first()

        if not record:
            raise ValidationError(f"No active loan found for book copy '{accession_number}'.")

        now = timezone.now()
        record.return_date = now
        record.status = BorrowRecord.Status.RETURNED
        if notes:
            record.notes = f"{record.notes}\nReturn note: {notes}".strip()
        record.save()

        if condition and condition in BookCopy.Condition.values:
            copy.condition = condition

        # Check overdue and calculate fine
        fine_generated = None
        if now > record.due_date:
            delta_days = max(1, (now.date() - record.due_date.date()).days)
            fine_amount = delta_days * settings.FINE_PER_DAY_RS
            fine_generated = Fine.objects.create(
                borrow_record=record,
                user=record.user,
                amount=fine_amount,
                status=Fine.Status.UNPAID,
                reason=f"Overdue return ({delta_days} day(s) at Rs. {settings.FINE_PER_DAY_RS}/day)"
            )
            Notification.objects.create(
                user=record.user,
                title="Overdue Fine Applied",
                message=f"A fine of Rs. {fine_amount:.2f} has been incurred for late return of '{copy.book.title}'.",
                notification_type=Notification.NotificationType.OVERDUE_ALERT
            )

        # Check reservation waitlist
        pending_reservation = Reservation.objects.filter(
            book=copy.book,
            status=Reservation.Status.PENDING
        ).order_by('queue_position', 'reserved_at').first()

        if pending_reservation:
            pending_reservation.allocated_copy = copy
            pending_reservation.status = Reservation.Status.READY_FOR_PICKUP
            pending_reservation.hold_expires_at = now + timedelta(hours=settings.HOLD_EXPIRY_HOURS)
            pending_reservation.save()

            copy.status = BookCopy.Status.ON_HOLD
            copy.save()

            Notification.objects.create(
                user=pending_reservation.user,
                title="Reserved Book Ready for Pickup",
                message=f"'{copy.book.title}' is now ready at the library desk. Please collect it before {pending_reservation.hold_expires_at.strftime('%Y-%m-%d %H:%M')}.",
                notification_type=Notification.NotificationType.HOLD_READY
            )
        else:
            copy.status = BookCopy.Status.AVAILABLE
            copy.save()

        return record, fine_generated

    @staticmethod
    def renew_book(user, borrow_record_id):
        try:
            record = BorrowRecord.objects.select_related('book_copy__book').get(id=borrow_record_id)
        except BorrowRecord.DoesNotExist:
            raise ValidationError("Borrow record not found.")

        # Permission check
        if user.role not in [User.Role.ADMIN, User.Role.LIBRARIAN] and record.user != user:
            raise ValidationError("You do not have permission to renew this loan.")

        if record.status != BorrowRecord.Status.ACTIVE:
            raise ValidationError("Only active loans can be renewed.")

        if timezone.now() > record.due_date:
            raise ValidationError("Cannot renew an overdue book. Please return it to the library desk and settle any fines.")

        max_renewals = 1 if record.user.role == User.Role.STUDENT else 2
        if record.renewal_count >= max_renewals:
            raise ValidationError(f"Maximum loan renewal limit ({max_renewals} times) reached.")

        # Check if anyone is waiting for this book in queue
        has_waiting_patrons = Reservation.objects.filter(
            book=record.book_copy.book,
            status=Reservation.Status.PENDING
        ).exists()
        if has_waiting_patrons:
            raise ValidationError("Cannot renew this book because another patron has placed a reservation request on it.")

        loan_days = settings.STUDENT_LOAN_DAYS if record.user.role == User.Role.STUDENT else settings.LECTURER_LOAN_DAYS
        record.due_date = record.due_date + timedelta(days=loan_days)
        record.renewal_count += 1
        record.save()

        Notification.objects.create(
            user=record.user,
            title="Loan Period Extended",
            message=f"Loan for '{record.book_copy.book.title}' extended. New due date is {record.due_date.strftime('%Y-%m-%d')}.",
            notification_type=Notification.NotificationType.DUE_REMINDER
        )

        return record
