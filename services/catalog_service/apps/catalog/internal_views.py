from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Book, BookCopy
from .serializers import BookCopySerializer
from django.db.models import F

def check_internal_api_key(request):
    """Validate internal API key for service-to-service calls."""
    api_key = request.headers.get('X-Internal-API-Key', '')
    expected_key = getattr(settings, 'INTERNAL_API_KEY', 'dev-internal-api-key-catalog')
    return api_key == expected_key


class InternalCopyDetailView(APIView):
    """Get copy details by accession number (internal)."""
    permission_classes = []  # No JWT needed for internal calls
    authentication_classes = []  # No auth needed

    def get(self, request, accession):
        if not check_internal_api_key(request):
            return Response({'error': 'Invalid internal API key'}, status=status.HTTP_403_FORBIDDEN)
        try:
            copy = BookCopy.objects.select_related('book').get(accession_number__iexact=accession)
            return Response({
                'id': copy.id,
                'book_id': copy.book_id,
                'book_title': copy.book.title,
                'book_isbn': copy.book.isbn,
                'accession_number': copy.accession_number,
                'item_type': copy.item_type,
                'status': copy.status,
                'condition': copy.condition,
            })
        except BookCopy.DoesNotExist:
            return Response({'error': f'Copy not found: {accession}'}, status=status.HTTP_404_NOT_FOUND)


class InternalCopyStatusUpdateView(APIView):
    """Update copy status (internal, called by Library Functions)."""
    permission_classes = []
    authentication_classes = []

    def patch(self, request, pk):
        if not check_internal_api_key(request):
            return Response({'error': 'Invalid internal API key'}, status=status.HTTP_403_FORBIDDEN)
        try:
            copy = BookCopy.objects.get(pk=pk)
        except BookCopy.DoesNotExist:
            return Response({'error': 'Copy not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        new_condition = request.data.get('condition')
        if new_status and new_status in BookCopy.Status.values:
            copy.status = new_status
        if new_condition and new_condition in BookCopy.Condition.values:
            copy.condition = new_condition
        copy.save()
        return Response({'id': copy.id, 'status': copy.status, 'condition': copy.condition})


class InternalBookIncrementStatView(APIView):
    """Increment borrow_count or hold_count on a book (internal)."""
    permission_classes = []
    authentication_classes = []

    def post(self, request, pk):
        if not check_internal_api_key(request):
            return Response({'error': 'Invalid internal API key'}, status=status.HTTP_403_FORBIDDEN)
        field = request.data.get('field')  # 'borrow_count' or 'hold_count'
        if field not in ('borrow_count', 'hold_count', 'search_count'):
            return Response({'error': 'Invalid field'}, status=status.HTTP_400_BAD_REQUEST)
        updated = Book.objects.filter(pk=pk).update(**{field: F(field) + 1})
        if not updated:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'status': 'ok', 'field': field})


class InternalBookDetailView(APIView):
    """Get book details by ID (internal)."""
    permission_classes = []
    authentication_classes = []

    def get(self, request, pk):
        if not check_internal_api_key(request):
            return Response({'error': 'Invalid internal API key'}, status=status.HTTP_403_FORBIDDEN)
        try:
            book = Book.objects.get(pk=pk)
            return Response({
                'id': book.id,
                'title': book.title,
                'isbn': book.isbn,
                'call_number': book.call_number,
                'borrow_count': book.borrow_count,
                'hold_count': book.hold_count,
                'search_count': book.search_count,
            })
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)


class InternalCopyAvailabilityView(APIView):
    """Check copy availability for a book (internal)."""
    permission_classes = []
    authentication_classes = []

    def get(self, request, book_id):
        if not check_internal_api_key(request):
            return Response({'error': 'Invalid internal API key'}, status=status.HTTP_403_FORBIDDEN)
        copies = BookCopy.objects.filter(book_id=book_id)
        available = copies.filter(status=BookCopy.Status.AVAILABLE).first()
        return Response({
            'book_id': book_id,
            'total_copies': copies.count(),
            'available_count': copies.filter(status=BookCopy.Status.AVAILABLE).count(),
            'first_available_copy': {
                'id': available.id,
                'accession_number': available.accession_number,
                'item_type': available.item_type,
            } if available else None
        })
