from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    patron_name = serializers.ReadOnlyField(source='user.get_full_name')
    patron_reg_number = serializers.ReadOnlyField(source='user.reg_number')
    patron_phone = serializers.ReadOnlyField(source='user.phone_number')
    patron_email = serializers.ReadOnlyField(source='user.email')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.ReadOnlyField(source='is_hold_expired')
    # Use denormalized fields
    allocated_copy_barcode = serializers.ReadOnlyField(source='allocated_copy_accession')

    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'patron_name', 'patron_reg_number', 'patron_phone', 'patron_email',
            'book_id', 'book_title', 'book_isbn', 'allocated_copy_id', 'allocated_copy_barcode',
            'queue_position', 'status', 'status_display', 'reserved_at',
            'hold_expires_at', 'is_expired'
        ]
        read_only_fields = ['id', 'user', 'queue_position', 'status', 'reserved_at', 'hold_expires_at']

class CreateReservationSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
