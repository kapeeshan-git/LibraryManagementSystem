from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from .models import BorrowRecord
from .serializers import (
    BorrowRecordSerializer,
    IssueBookSerializer,
    ReturnBookSerializer,
    RenewBookSerializer
)
from .services import CirculationService
from apps.authentication.models import User

class IssueBookView(APIView):
    """Librarian / Admin endpoint to issue a book to a student or lecturer."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.is_admin_or_librarian:
            return Response({'error': 'Unauthorized. Staff role required.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = IssueBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        record = CirculationService.issue_book(
            librarian_user=request.user,
            patron_reg_number=serializer.validated_data['patron_reg_number'],
            accession_number=serializer.validated_data['accession_number'],
            notes=serializer.validated_data.get('notes', '')
        )

        return Response(BorrowRecordSerializer(record).data, status=status.HTTP_201_CREATED)


class ReturnBookView(APIView):
    """Librarian / Admin endpoint to process a book return via accession barcode."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.is_admin_or_librarian:
            return Response({'error': 'Unauthorized. Staff role required.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReturnBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        record, fine = CirculationService.return_book(
            librarian_user=request.user,
            accession_number=serializer.validated_data['accession_number'],
            condition=serializer.validated_data.get('condition'),
            notes=serializer.validated_data.get('notes', '')
        )

        response_data = {
            'message': 'Book return processed successfully.',
            'record': BorrowRecordSerializer(record).data,
            'fine_imposed': fine.amount if fine else 0.00
        }
        return Response(response_data, status=status.HTTP_200_OK)


class RenewBookView(APIView):
    """Extend loan period for active borrow record."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RenewBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        record = CirculationService.renew_book(
            user=request.user,
            borrow_record_id=serializer.validated_data['borrow_record_id']
        )
        return Response({
            'message': 'Book loan renewed successfully.',
            'new_due_date': record.due_date,
            'record': BorrowRecordSerializer(record).data
        }, status=status.HTTP_200_OK)


class BorrowRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """List and inspect loans."""
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = BorrowRecord.objects.select_related('user', 'book_copy__book', 'issued_by')
        if not user.is_admin_or_librarian:
            qs = qs.filter(user=user)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs
