from rest_framework import serializers
from .models import Category, Author, Book, BookCopy

class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.IntegerField(source='books.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'code', 'description', 'book_count']


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'biography']


class BookCopySerializer(serializers.ModelSerializer):
    book_title = serializers.ReadOnlyField(source='book.title')
    book_isbn = serializers.ReadOnlyField(source='book.isbn')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)

    class Meta:
        model = BookCopy
        fields = [
            'id', 'book', 'book_title', 'book_isbn', 'accession_number',
            'status', 'status_display', 'condition', 'condition_display',
            'acquisition_date', 'notes'
        ]


class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    author_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Author.objects.all(),
        source='authors',
        write_only=True,
        required=False
    )
    category_name = serializers.ReadOnlyField(source='category.name')
    available_copies_count = serializers.ReadOnlyField()
    total_copies_count = serializers.ReadOnlyField()
    copies = BookCopySerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'isbn', 'authors', 'author_ids', 'category',
            'category_name', 'publisher', 'publication_year', 'edition',
            'shelf_location', 'description', 'cover_image',
            'available_copies_count', 'total_copies_count', 'copies',
            'created_at', 'updated_at'
        ]
