from django.contrib import admin
from .models import Category, Author, Book, BookCopy

class BookCopyInline(admin.TabularInline):
    model = BookCopy
    extra = 1
    fields = ('accession_number', 'status', 'condition', 'notes')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'isbn', 'category', 'shelf_location', 'available_copies_count', 'total_copies_count')
    list_filter = ('category', 'publication_year')
    search_fields = ('title', 'isbn', 'authors__name')
    inlines = [BookCopyInline]

@admin.register(BookCopy)
class BookCopyAdmin(admin.ModelAdmin):
    list_display = ('accession_number', 'book', 'status', 'condition', 'acquisition_date')
    list_filter = ('status', 'condition')
    search_fields = ('accession_number', 'book__title', 'book__isbn')
