from rest_framework import serializers
from .models import Reservation
from apps.catalog.serializers import BookSerializer, BookCopySerializer

class ReservationSerializer(serializers.ModelSerializer):
    patron_name = serializers.ReadOnlyField(source='user.get_full_name')
    patron_reg_number = serializers.ReadOnlyField(source='user.reg_number')
    book_title = serializers.ReadOnlyField(source='book.title')
    book_isbn = serializers.ReadOnlyField(source='book.isbn')
    allocated_copy_barcode = serializers.ReadOnlyField(source='allocated_copy.accession_number')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.ReadOnlyField(source='is_hold_expired')

    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'patron_name', 'patron_reg_number', 'book',
            'book_title', 'book_isbn', 'allocated_copy', 'allocated_copy_barcode',
            'queue_position', 'status', 'status_display', 'reserved_at',
            'hold_expires_at', 'is_expired'
        ]
        read_only_fields = ['id', 'user', 'queue_position', 'status', 'reserved_at', 'hold_expires_at']


class CreateReservationSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
