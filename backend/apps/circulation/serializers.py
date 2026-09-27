from rest_framework import serializers
from .models import BorrowRecord
from apps.catalog.serializers import BookCopySerializer
from apps.authentication.serializers import UserSerializer

class BorrowRecordSerializer(serializers.ModelSerializer):
    patron_name = serializers.ReadOnlyField(source='user.get_full_name')
    patron_reg_number = serializers.ReadOnlyField(source='user.reg_number')
    patron_role = serializers.ReadOnlyField(source='user.role')
    book_title = serializers.ReadOnlyField(source='book_copy.book.title')
    book_isbn = serializers.ReadOnlyField(source='book_copy.book.isbn')
    accession_number = serializers.ReadOnlyField(source='book_copy.accession_number')
    is_overdue = serializers.ReadOnlyField(source='is_currently_overdue')
    overdue_days_count = serializers.ReadOnlyField(source='overdue_days')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = BorrowRecord
        fields = [
            'id', 'user', 'patron_name', 'patron_reg_number', 'patron_role',
            'book_copy', 'book_title', 'book_isbn', 'accession_number',
            'issued_by', 'issue_date', 'due_date', 'return_date',
            'renewal_count', 'status', 'status_display', 'is_overdue',
            'overdue_days_count', 'notes'
        ]
        read_only_fields = ['id', 'issue_date', 'issued_by']


class IssueBookSerializer(serializers.Serializer):
    patron_reg_number = serializers.CharField(max_length=50)
    accession_number = serializers.CharField(max_length=100)
    notes = serializers.CharField(required=False, allow_blank=True)


class ReturnBookSerializer(serializers.Serializer):
    accession_number = serializers.CharField(max_length=100)
    condition = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class RenewBookSerializer(serializers.Serializer):
    borrow_record_id = serializers.IntegerField()


class CirculationRuleSerializer(serializers.ModelSerializer):
    patron_category_display = serializers.CharField(source='get_patron_category_display', read_only=True)
    item_type_display = serializers.CharField(source='get_item_type_display', read_only=True)

    class Meta:
        from .models import CirculationRule
        model = CirculationRule
        fields = [
            'id', 'patron_category', 'patron_category_display',
            'item_type', 'item_type_display', 'max_checkouts',
            'loan_period_days', 'fine_per_day_rs', 'grace_period_days',
            'max_renewals', 'holds_allowed', 'description',
            'created_at', 'updated_at'
        ]
