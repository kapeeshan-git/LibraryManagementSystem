from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import Category, Author, Book, BookCopy
from .serializers import (
    CategorySerializer,
    AuthorSerializer,
    BookSerializer,
    BookCopySerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().prefetch_related('authors', 'copies').select_related('category')
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        query = self.request.query_params.get('q')
        category_id = self.request.query_params.get('category')
        available_only = self.request.query_params.get('available') == 'true'

        if query:
            qs = qs.filter(
                Q(title__icontains=query) |
                Q(isbn__icontains=query) |
                Q(authors__name__icontains=query) |
                Q(shelf_location__icontains=query)
            ).distinct()

        if category_id:
            qs = qs.filter(category_id=category_id)

        if available_only:
            qs = qs.filter(copies__status=BookCopy.Status.AVAILABLE).distinct()

        return qs


class BookCopyViewSet(viewsets.ModelViewSet):
    queryset = BookCopy.objects.all().select_related('book')
    serializer_class = BookCopySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'lookup']:
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='lookup')
    def lookup(self, request):
        """Lookup copy by barcode/accession number for rapid desk circulation."""
        barcode = request.query_params.get('barcode', '').strip()
        if not barcode:
            return Response({'error': 'Missing barcode query parameter.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            copy = BookCopy.objects.select_related('book').get(accession_number=barcode)
            serializer = self.get_serializer(copy)
            return Response(serializer.data)
        except BookCopy.DoesNotExist:
            return Response({'error': f'No book copy found with barcode/accession number: {barcode}'}, status=status.HTTP_404_NOT_FOUND)
