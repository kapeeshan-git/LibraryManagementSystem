from rest_framework import serializers
from django.db import transaction
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
    item_type_display = serializers.CharField(source='get_item_type_display', read_only=True)

    class Meta:
        model = BookCopy
        fields = [
            'id', 'book', 'book_title', 'book_isbn', 'accession_number',
            'item_type', 'item_type_display', 'status', 'status_display',
            'condition', 'condition_display', 'acquisition_date', 'notes'
        ]

    def validate_accession_number(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Accession number / Barcode cannot be blank.")
        qs = BookCopy.objects.filter(accession_number__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"Barcode / Accession number '{val}' is already assigned to another copy.")
        return val


class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    author_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Author.objects.all(),
        source='authors',
        write_only=True,
        required=False
    )
    author_names = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Comma-separated author names (e.g. 'Dr. A. Perera, Prof. S. Vimalan')"
    )
    category_name = serializers.ReadOnlyField(source='category.name')
    available_copies_count = serializers.ReadOnlyField()
    total_copies_count = serializers.ReadOnlyField()
    copies = BookCopySerializer(many=True, read_only=True)

    # Physical copy accession barcode (Mandatory when adding a new book)
    accession_number = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Accession number / barcode for single physical copy"
    )
    item_type = serializers.ChoiceField(
        choices=BookCopy.ItemType.choices,
        default=BookCopy.ItemType.STANDARD,
        write_only=True,
        required=False
    )
    condition = serializers.ChoiceField(
        choices=BookCopy.Condition.choices,
        default=BookCopy.Condition.GOOD,
        write_only=True,
        required=False
    )
    copy_notes = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    # Batch physical copies support
    initial_copies = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of physical copies to create (each with accession_number, item_type, condition, notes)"
    )

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'isbn', 'authors', 'author_ids', 'author_names',
            'category', 'category_name', 'publisher', 'publication_year',
            'edition', 'call_number', 'shelf_location', 'description',
            'cover_image', 'available_copies_count', 'total_copies_count',
            'copies', 'accession_number', 'item_type', 'condition',
            'copy_notes', 'initial_copies', 'search_count', 'borrow_count', 'hold_count',
            'created_at', 'updated_at'
        ]


class BookStatisticsItemSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    available_copies_count = serializers.ReadOnlyField()
    total_copies_count = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'isbn', 'authors', 'category_name',
            'call_number', 'shelf_location', 'edition', 'publication_year',
            'available_copies_count', 'total_copies_count',
            'search_count', 'borrow_count', 'hold_count'
        ]

    def validate(self, attrs):
        # When creating a new book, at least one barcode is mandatory
        if self.instance is None:
            initial_copies = attrs.get('initial_copies')
            accession_number = (attrs.get('accession_number') or '').strip()

            if initial_copies and isinstance(initial_copies, list) and len(initial_copies) > 0:
                if len(initial_copies) > 100:
                    raise serializers.ValidationError({
                        'initial_copies': 'Maximum 100 copies can be cataloged at once.'
                    })
                barcodes_seen = set()
                for idx, copy_data in enumerate(initial_copies):
                    bc = (copy_data.get('accession_number') or '').strip()
                    if not bc:
                        raise serializers.ValidationError({
                            'initial_copies': f'Copy #{idx + 1} is missing an accession barcode.'
                        })
                    if bc.lower() in barcodes_seen:
                        raise serializers.ValidationError({
                            'initial_copies': f"Duplicate barcode '{bc}' specified in your copy list."
                        })
                    barcodes_seen.add(bc.lower())
                    if BookCopy.objects.filter(accession_number__iexact=bc).exists():
                        raise serializers.ValidationError({
                            'initial_copies': f"Barcode '{bc}' is already registered to another copy in the library."
                        })
            else:
                if not accession_number:
                    raise serializers.ValidationError({
                        'accession_number': 'Physical copy Barcode / Accession Number is required when cataloging a book.'
                    })
                if BookCopy.objects.filter(accession_number__iexact=accession_number).exists():
                    raise serializers.ValidationError({
                        'accession_number': f"Barcode / Accession Number '{accession_number}' is already registered."
                    })

            isbn = (attrs.get('isbn') or '').strip()
            if not isbn:
                raise serializers.ValidationError({'isbn': 'ISBN is required.'})
            if Book.objects.filter(isbn__iexact=isbn).exists():
                raise serializers.ValidationError({'isbn': f"A book with ISBN '{isbn}' is already cataloged."})
        else:
            # Editing existing book
            isbn = attrs.get('isbn')
            if isbn:
                isbn = isbn.strip()
                if Book.objects.filter(isbn__iexact=isbn).exclude(pk=self.instance.pk).exists():
                    raise serializers.ValidationError({'isbn': f"A book with ISBN '{isbn}' is already cataloged."})

        return attrs

    def create(self, validated_data):
        initial_copies = validated_data.pop('initial_copies', None)
        author_names = validated_data.pop('author_names', '')
        authors = validated_data.pop('authors', [])
        accession_number = (validated_data.pop('accession_number', '') or '').strip()
        item_type = validated_data.pop('item_type', BookCopy.ItemType.STANDARD)
        condition = validated_data.pop('condition', BookCopy.Condition.GOOD)
        copy_notes = validated_data.pop('copy_notes', '')

        with transaction.atomic():
            book = Book.objects.create(**validated_data)

            # Resolve authors
            final_authors = list(authors)
            if author_names:
                for name in [n.strip() for n in author_names.split(',') if n.strip()]:
                    auth_obj, _ = Author.objects.get_or_create(name=name)
                    if auth_obj not in final_authors:
                        final_authors.append(auth_obj)

            if final_authors:
                book.authors.set(final_authors)

            # Create physical copies
            if initial_copies and isinstance(initial_copies, list) and len(initial_copies) > 0:
                for c in initial_copies:
                    bc = (c.get('accession_number') or '').strip()
                    if bc:
                        BookCopy.objects.create(
                            book=book,
                            accession_number=bc,
                            item_type=c.get('item_type') or BookCopy.ItemType.STANDARD,
                            condition=c.get('condition') or BookCopy.Condition.GOOD,
                            notes=c.get('notes') or c.get('copy_notes') or '',
                            status=BookCopy.Status.AVAILABLE
                        )
            elif accession_number:
                BookCopy.objects.create(
                    book=book,
                    accession_number=accession_number,
                    item_type=item_type,
                    condition=condition,
                    notes=copy_notes,
                    status=BookCopy.Status.AVAILABLE
                )

            return book

    def update(self, instance, validated_data):
        author_names = validated_data.pop('author_names', None)
        authors = validated_data.pop('authors', None)
        validated_data.pop('accession_number', None)
        validated_data.pop('item_type', None)
        validated_data.pop('condition', None)
        validated_data.pop('copy_notes', None)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if authors is not None or author_names is not None:
                final_authors = list(authors) if authors is not None else []
                if author_names is not None:
                    for name in [n.strip() for n in author_names.split(',') if n.strip()]:
                        auth_obj, _ = Author.objects.get_or_create(name=name)
                        if auth_obj not in final_authors:
                            final_authors.append(auth_obj)

                if final_authors or (authors is not None and len(authors) == 0 and not author_names):
                    instance.authors.set(final_authors)

            return instance
