from rest_framework import serializers
from .models import Fine, PaymentReceipt

class PaymentReceiptSerializer(serializers.ModelSerializer):
    collected_by_name = serializers.ReadOnlyField(source='collected_by.get_full_name')
    class Meta:
        model = PaymentReceipt
        fields = ['id', 'fine', 'receipt_number', 'amount_paid', 'payment_method', 'collected_by', 'collected_by_name', 'paid_at', 'notes']
        read_only_fields = ['id', 'receipt_number', 'collected_by', 'paid_at']

class FineSerializer(serializers.ModelSerializer):
    patron_name = serializers.ReadOnlyField(source='user.get_full_name')
    patron_reg_number = serializers.ReadOnlyField(source='user.reg_number')
    book_title = serializers.ReadOnlyField(source='borrow_record.book_title')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    balance_amount = serializers.ReadOnlyField(source='balance')
    receipts = PaymentReceiptSerializer(many=True, read_only=True)
    class Meta:
        model = Fine
        fields = [
            'id', 'user', 'patron_name', 'patron_reg_number', 'borrow_record',
            'book_title', 'amount', 'paid_amount', 'balance_amount',
            'status', 'status_display', 'reason', 'calculated_at', 'receipts'
        ]

class RecordPaymentSerializer(serializers.Serializer):
    fine_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=PaymentReceipt.PaymentMethod.choices, default=PaymentReceipt.PaymentMethod.CASH)
    notes = serializers.CharField(required=False, allow_blank=True)
