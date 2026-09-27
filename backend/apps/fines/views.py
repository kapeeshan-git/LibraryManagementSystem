from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from decimal import Decimal
from .models import Fine, PaymentReceipt
from .serializers import FineSerializer, PaymentReceiptSerializer, RecordPaymentSerializer
from apps.notifications.models import Notification

class FineViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Fine.objects.select_related('user', 'borrow_record__book_copy__book').prefetch_related('receipts')
        if not user.is_admin_or_librarian:
            qs = qs.filter(user=user)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class RecordPaymentView(APIView):
    """Librarian / Admin settles or logs payment against an outstanding fine."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.is_admin_or_librarian:
            return Response({'error': 'Unauthorized. Staff role required to process fine payments.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = RecordPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        fine_id = serializer.validated_data['fine_id']
        amount = serializer.validated_data['amount']
        method = serializer.validated_data['payment_method']
        notes = serializer.validated_data.get('notes', '')

        try:
            fine = Fine.objects.get(id=fine_id)
        except Fine.DoesNotExist:
            return Response({'error': 'Fine not found.'}, status=status.HTTP_404_NOT_FOUND)

        if fine.status == Fine.Status.PAID:
            return Response({'error': 'This fine has already been settled in full.'}, status=status.HTTP_400_BAD_REQUEST)

        # Record receipt
        receipt = PaymentReceipt.objects.create(
            fine=fine,
            amount_paid=amount,
            payment_method=method,
            collected_by=request.user,
            notes=notes
        )

        fine.paid_amount += amount
        fine.update_status()
        fine.save()

        Notification.objects.create(
            user=fine.user,
            title="Fine Payment Received",
            message=f"Payment of Rs. {amount:.2f} received (Receipt: {receipt.receipt_number}). Current balance: Rs. {fine.balance:.2f}.",
            notification_type=Notification.NotificationType.GENERAL
        )

        return Response({
            'message': 'Payment recorded successfully.',
            'receipt': PaymentReceiptSerializer(receipt).data,
            'fine': FineSerializer(fine).data
        }, status=status.HTTP_201_CREATED)
