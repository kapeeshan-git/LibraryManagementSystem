from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count
from django.utils import timezone
from django.http import HttpResponse
import csv

from apps.catalog.models import Book, BookCopy
from apps.circulation.models import BorrowRecord
from apps.fines.models import Fine
from apps.repository.models import ResearchPaper
from apps.reservations.models import Reservation
from apps.authentication.models import User

class DashboardMetricsView(APIView):
    """Aggregate dashboard metrics for librarians and administrators."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin_or_librarian:
            # Student / Lecturer quick metrics
            user = request.user
            my_loans = BorrowRecord.objects.filter(user=user, status=BorrowRecord.Status.ACTIVE).count()
            my_overdues = BorrowRecord.objects.filter(user=user, status=BorrowRecord.Status.ACTIVE, due_date__lt=timezone.now()).count()
            my_holds = Reservation.objects.filter(user=user, status__in=[Reservation.Status.PENDING, Reservation.Status.READY_FOR_PICKUP]).count()
            my_unpaid_fines = Fine.objects.filter(user=user, status__in=[Fine.Status.UNPAID, Fine.Status.PARTIALLY_PAID]).aggregate(
                total=Sum('amount') - Sum('paid_amount')
            )['total'] or 0.00

            return Response({
                'role': user.role,
                'my_active_loans': my_loans,
                'my_overdue_loans': my_overdues,
                'my_active_holds': my_holds,
                'my_unpaid_fines_rs': float(my_unpaid_fines)
            })

        # Staff system-wide dashboard
        total_books = Book.objects.count()
        total_copies = BookCopy.objects.count()
        available_copies = BookCopy.objects.filter(status=BookCopy.Status.AVAILABLE).count()
        active_loans = BorrowRecord.objects.filter(status=BorrowRecord.Status.ACTIVE).count()
        overdue_loans = BorrowRecord.objects.filter(status=BorrowRecord.Status.ACTIVE, due_date__lt=timezone.now()).count()
        
        fines_unpaid_agg = Fine.objects.filter(status__in=[Fine.Status.UNPAID, Fine.Status.PARTIALLY_PAID]).aggregate(
            unpaid=Sum('amount') - Sum('paid_amount')
        )['unpaid'] or 0.00

        total_fines_collected = Fine.objects.aggregate(collected=Sum('paid_amount'))['collected'] or 0.00
        total_papers = ResearchPaper.objects.count()
        pending_papers = ResearchPaper.objects.filter(status=ResearchPaper.ApprovalStatus.PENDING).count()
        active_reservations = Reservation.objects.filter(status__in=[Reservation.Status.PENDING, Reservation.Status.READY_FOR_PICKUP]).count()
        total_patrons = User.objects.filter(role__in=[User.Role.STUDENT, User.Role.LECTURER]).count()

        total_catalog_searches = Book.objects.aggregate(total=Sum('search_count'))['total'] or 0
        total_cumulative_borrows = Book.objects.aggregate(total=Sum('borrow_count'))['total'] or 0
        total_cumulative_holds = Book.objects.aggregate(total=Sum('hold_count'))['total'] or 0

        return Response({
            'total_titles': total_books,
            'total_physical_copies': total_copies,
            'available_copies': available_copies,
            'active_loans': active_loans,
            'overdue_loans': overdue_loans,
            'total_patrons': total_patrons,
            'outstanding_fines_rs': float(fines_unpaid_agg),
            'collected_fines_rs': float(total_fines_collected),
            'total_research_papers': total_papers,
            'pending_papers_for_review': pending_papers,
            'active_reservations': active_reservations,
            'total_catalog_searches': total_catalog_searches,
            'total_cumulative_borrows': total_cumulative_borrows,
            'total_cumulative_holds': total_cumulative_holds,
        })


class ExportCirculationCSVView(APIView):
    """Export circulation records to CSV file."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin_or_librarian:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="circulation_records.csv"'

        writer = csv.writer(response)
        writer.writerow(['Record ID', 'Patron Reg No', 'Patron Name', 'Book Title', 'ISBN', 'Barcode', 'Issue Date', 'Due Date', 'Return Date', 'Status'])

        records = BorrowRecord.objects.select_related('user', 'book_copy__book').order_by('-issue_date')[:500]
        for r in records:
            writer.writerow([
                r.id,
                r.user.reg_number,
                r.user.get_full_name(),
                r.book_copy.book.title,
                r.book_copy.book.isbn,
                r.book_copy.accession_number,
                r.issue_date.strftime('%Y-%m-%d %H:%M'),
                r.due_date.strftime('%Y-%m-%d %H:%M'),
                r.return_date.strftime('%Y-%m-%d %H:%M') if r.return_date else 'N/A',
                r.get_status_display()
            ])

        return response
