from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from apps.reservations.models import Reservation
from apps.fines.models import Fine
from apps.notifications.models import Notification
from .models import BorrowRecord
from clients import catalog_client
from django_q.tasks import async_task

User = get_user_model()

class CirculationService:
    @staticmethod
    def get_circulation_rule(patron_role, item_type='STANDARD'):
        from .models import CirculationRule
        rule = CirculationRule.objects.filter(patron_category=patron_role, item_type=item_type).first()
        if rule:
            return rule
        rule = CirculationRule.objects.filter(patron_category=patron_role, item_type=CirculationRule.ItemCategory.ALL).first()
        if rule:
            return rule
        rule = CirculationRule.objects.filter(patron_category=CirculationRule.PatronCategory.ALL, item_type=item_type).first()
        if rule:
            return rule
        rule = CirculationRule.objects.filter(patron_category=CirculationRule.PatronCategory.ALL, item_type=CirculationRule.ItemCategory.ALL).first()
        if rule:
            return rule
        is_student = (patron_role == 'STUDENT')
        return CirculationRule(
            patron_category=patron_role, item_type=item_type,
            max_checkouts=getattr(settings, 'STUDENT_MAX_BOOKS', 2) if is_student else getattr(settings, 'LECTURER_MAX_BOOKS', 5),
            loan_period_days=getattr(settings, 'STUDENT_LOAN_DAYS', 14) if is_student else getattr(settings, 'LECTURER_LOAN_DAYS', 90),
            fine_per_day_rs=getattr(settings, 'FINE_PER_DAY_RS', 10.00),
            grace_period_days=1, max_renewals=1 if is_student else 2, holds_allowed=True
        )

    @staticmethod
    def issue_book(librarian_user, patron_reg_number, accession_number, notes=''):
        try:
            patron = User.objects.get(reg_number=patron_reg_number)
        except User.DoesNotExist:
            raise ValidationError(f"Patron with registration/ID '{patron_reg_number}' not found.")
        if not patron.is_active_patron or not patron.is_active:
            reason = f": {patron.debarment_reason}" if patron.debarment_reason else "."
            raise ValidationError(f"Patron's borrowing privileges are currently suspended{reason}")

        # Fetch copy from Catalog Service
        copy_data = catalog_client.get_copy_by_accession(accession_number)
        if not copy_data:
            raise ValidationError(f"Book copy with accession number/barcode '{accession_number}' not found.")
        if copy_data.get('item_type') == 'REFERENCE':
            raise ValidationError("This item is marked as Reference / Non-circulating.")

        rule = CirculationService.get_circulation_rule(patron.role, copy_data.get('item_type', 'STANDARD'))
        active_loans_count = BorrowRecord.objects.filter(user=patron, status=BorrowRecord.Status.ACTIVE).count()
        if active_loans_count >= rule.max_checkouts:
            raise ValidationError(f"Patron has reached the maximum borrowing limit of {rule.max_checkouts} book(s).")
        has_overdue = BorrowRecord.objects.filter(user=patron, status=BorrowRecord.Status.ACTIVE, due_date__lt=timezone.now()).exists()
        if has_overdue:
            raise ValidationError("Patron has one or more overdue books.")

        copy_status = copy_data.get('status', '')
        copy_id = copy_data['id']
        book_id = copy_data.get('book_id', 0)
        book_title = copy_data.get('book_title', '')
        book_isbn = copy_data.get('book_isbn', '')

        if copy_status == 'ON_HOLD':
            hold = Reservation.objects.filter(
                allocated_copy_id=copy_id, user=patron, status=Reservation.Status.READY_FOR_PICKUP
            ).first()
            if not hold:
                raise ValidationError("This physical copy is currently on hold for another patron.")
            hold.status = Reservation.Status.COMPLETED
            hold.save()
        elif copy_status != 'AVAILABLE':
            raise ValidationError(f"Book copy is not available for loan (Current status: {copy_status}).")

        due_date = timezone.now() + timedelta(days=rule.loan_period_days)
        borrow_record = BorrowRecord.objects.create(
            user=patron, book_copy_id=copy_id, accession_number=accession_number,
            book_id=book_id, book_title=book_title, book_isbn=book_isbn,
            item_type=copy_data.get('item_type', 'STANDARD'),
            issued_by=librarian_user, issue_date=timezone.now(),
            due_date=due_date, status=BorrowRecord.Status.ACTIVE, notes=notes
        )

        # Update copy status in Catalog Service
        async_task(catalog_client.update_copy_status, copy_id, 'BORROWED')
        async_task(catalog_client.increment_book_stat, book_id, 'borrow_count')

        Notification.objects.create(
            user=patron, title="Book Issued Successfully",
            message=f"'{book_title}' (Copy: {accession_number}) has been issued. Due date is {due_date.strftime('%Y-%m-%d')} ({rule.loan_period_days} day loan).",
            notification_type=Notification.NotificationType.DUE_REMINDER
        )
        return borrow_record

    @staticmethod
    def return_book(librarian_user, accession_number, condition=None, notes=''):
        copy_data = catalog_client.get_copy_by_accession(accession_number)
        if not copy_data:
            raise ValidationError(f"Book copy with accession number '{accession_number}' not found.")

        record = BorrowRecord.objects.filter(
            accession_number=accession_number, status=BorrowRecord.Status.ACTIVE
        ).order_by('-issue_date').first()
        if not record:
            raise ValidationError(f"No active loan found for book copy '{accession_number}'.")

        now = timezone.now()
        record.return_date = now
        record.status = BorrowRecord.Status.RETURNED
        if notes:
            record.notes = f"{record.notes}\nReturn note: {notes}".strip()
        record.save()

        if condition:
            async_task(catalog_client.update_copy_status, copy_data['id'], None, condition)

        fine_generated = None
        if now > record.due_date:
            delta_days = max(1, (now.date() - record.due_date.date()).days)
            rule = CirculationService.get_circulation_rule(record.user.role, record.item_type)
            billable_days = max(0, delta_days - rule.grace_period_days)
            if billable_days > 0:
                fine_amount = billable_days * rule.fine_per_day_rs
                fine_generated = Fine.objects.create(
                    borrow_record=record, user=record.user, amount=fine_amount,
                    status=Fine.Status.UNPAID,
                    reason=f"Overdue return ({delta_days} days late, {billable_days} billable days at Rs. {rule.fine_per_day_rs}/day)"
                )
                Notification.objects.create(
                    user=record.user, title="Overdue Fine Applied",
                    message=f"A fine of Rs. {fine_amount:.2f} has been incurred for late return of '{record.book_title}'.",
                    notification_type=Notification.NotificationType.OVERDUE_ALERT
                )

        # Check reservation waitlist
        pending_reservation = Reservation.objects.filter(
            book_id=record.book_id, status=Reservation.Status.PENDING
        ).order_by('queue_position', 'reserved_at').first()

        if pending_reservation:
            pending_reservation.allocated_copy_id = copy_data['id']
            pending_reservation.status = Reservation.Status.READY_FOR_PICKUP
            pending_reservation.hold_expires_at = now + timedelta(hours=settings.HOLD_EXPIRY_HOURS)
            pending_reservation.save()
            async_task(catalog_client.update_copy_status, copy_data['id'], 'ON_HOLD')
            Notification.objects.create(
                user=pending_reservation.user, title="Reserved Book Ready for Pickup",
                message=f"'{record.book_title}' is now ready at the library desk. Please collect it before {pending_reservation.hold_expires_at.strftime('%Y-%m-%d %H:%M')}.",
                notification_type=Notification.NotificationType.HOLD_READY
            )
        else:
            async_task(catalog_client.update_copy_status, copy_data['id'], 'AVAILABLE')

        return record, fine_generated, pending_reservation

    @staticmethod
    def renew_book(user, borrow_record_id):
        try:
            record = BorrowRecord.objects.get(id=borrow_record_id)
        except BorrowRecord.DoesNotExist:
            raise ValidationError("Borrow record not found.")
        if user.role not in ['ADMIN', 'LIBRARIAN'] and record.user != user:
            raise ValidationError("You do not have permission to renew this loan.")
        if record.status != BorrowRecord.Status.ACTIVE:
            raise ValidationError("Only active loans can be renewed.")
        if timezone.now() > record.due_date:
            raise ValidationError("Cannot renew an overdue book.")
        rule = CirculationService.get_circulation_rule(record.user.role, record.item_type)
        if record.renewal_count >= rule.max_renewals:
            raise ValidationError(f"Maximum loan renewal limit ({rule.max_renewals} time(s)) reached.")
        has_waiting_patrons = Reservation.objects.filter(
            book_id=record.book_id, status=Reservation.Status.PENDING
        ).exists()
        if has_waiting_patrons:
            raise ValidationError("Cannot renew this book because another patron is waiting in queue.")
        record.due_date = record.due_date + timedelta(days=rule.loan_period_days)
        record.renewal_count += 1
        record.save()
        Notification.objects.create(
            user=record.user, title="Loan Period Extended",
            message=f"Loan for '{record.book_title}' extended by {rule.loan_period_days} days. New due date is {record.due_date.strftime('%Y-%m-%d')}.",
            notification_type=Notification.NotificationType.DUE_REMINDER
        )
        return record

