from django.contrib import admin
from .models import BorrowRecord

@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'book_copy', 'issue_date', 'due_date', 'return_date', 'status', 'renewal_count')
    list_filter = ('status', 'issue_date', 'due_date')
    search_fields = ('user__username', 'user__reg_number', 'book_copy__accession_number', 'book_copy__book__title')
