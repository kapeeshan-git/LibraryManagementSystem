from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from .models import BorrowRecord, CirculationRule
from .serializers import (
    BorrowRecordSerializer, IssueBookSerializer,
    ReturnBookSerializer, RenewBookSerializer, CirculationRuleSerializer
)
from .services import CirculationService
from apps.authentication.models import User

class IssueBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        if not request.user.is_admin_or_librarian:
            return Response({'error': 'Unauthorized. Staff role required.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = IssueBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = CirculationService.issue_book(
            librarian_user=request.user,
            patron_reg_number=serializer.validated_data['patron_reg_number'],
            accession_number=serializer.validated_data['accession_number'],
            notes=serializer.validated_data.get('notes', '')
        )
        return Response(BorrowRecordSerializer(record).data, status=status.HTTP_201_CREATED)

class ReturnBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        if not request.user.is_admin_or_librarian:
            return Response({'error': 'Unauthorized. Staff role required.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ReturnBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record, fine, hold = CirculationService.return_book(
            librarian_user=request.user,
            accession_number=serializer.validated_data['accession_number'],
            condition=serializer.validated_data.get('condition'),
            notes=serializer.validated_data.get('notes', '')
        )
        response_data = {
            'message': 'Book return processed successfully.',
            'record': BorrowRecordSerializer(record).data,
            'fine_imposed': fine.amount if fine else 0.00,
            'hold_found': bool(hold),
            'hold_details': {
                'id': hold.id,
                'patron_name': hold.user.get_full_name() or hold.user.username,
                'patron_reg_number': hold.user.reg_number,
                'patron_phone': hold.user.phone_number,
                'patron_email': hold.user.email,
                'book_title': hold.book_title,
                'accession_number': hold.allocated_copy_accession or '',
                'hold_expires_at': hold.hold_expires_at,
            } if hold else None
        }
        return Response(response_data, status=status.HTTP_200_OK)

class RenewBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = RenewBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = CirculationService.renew_book(
            user=request.user, borrow_record_id=serializer.validated_data['borrow_record_id']
        )
        return Response({
            'message': 'Book loan renewed successfully.',
            'new_due_date': record.due_date,
            'record': BorrowRecordSerializer(record).data
        }, status=status.HTTP_200_OK)

class OverdueLoansView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        from django.utils import timezone
        if not request.user.is_admin_or_librarian:
            return Response({'error': 'Unauthorized. Staff role required.'}, status=status.HTTP_403_FORBIDDEN)
        overdues = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.ACTIVE, due_date__lt=timezone.now()
        ).select_related('user').order_by('due_date')
        results = []
        for rec in overdues:
            days = rec.overdue_days
            rule = CirculationService.get_circulation_rule(rec.user.role, rec.item_type)
            billable = max(0, days - rule.grace_period_days)
            est_fine = billable * rule.fine_per_day_rs
            results.append({
                'id': rec.id,
                'patron_name': rec.user.get_full_name() or rec.user.username,
                'patron_reg_number': rec.user.reg_number,
                'patron_role': rec.user.role,
                'patron_email': rec.user.email,
                'patron_phone': rec.user.phone_number,
                'book_title': rec.book_title,
                'accession_number': rec.accession_number,
                'issue_date': rec.issue_date,
                'due_date': rec.due_date,
                'overdue_days': days,
                'estimated_fine': float(est_fine)
            })
        return Response(results)

class BorrowRecordViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        qs = BorrowRecord.objects.select_related('user', 'issued_by')
        if not user.is_admin_or_librarian:
            qs = qs.filter(user=user)
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

class CirculationRuleViewSet(viewsets.ModelViewSet):
    queryset = CirculationRule.objects.all()
    serializer_class = CirculationRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        if not self.request.user.is_admin_or_librarian:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only library staff or administrators can modify circulation rules.")
        serializer.save()
    def perform_update(self, serializer):
        if not self.request.user.is_admin_or_librarian:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only library staff or administrators can modify circulation rules.")
        serializer.save()
