from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db import models
from .models import Department, CustomFieldDefinition
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    DepartmentSerializer,
    CSVBatchImportSerializer,
    CustomFieldDefinitionSerializer
)
import csv
import io

User = get_user_model()

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

class CurrentUserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class CustomFieldDefinitionViewSet(viewsets.ModelViewSet):
    queryset = CustomFieldDefinition.objects.all()
    serializer_class = CustomFieldDefinitionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        qs = super().get_queryset()
        entity_type = self.request.query_params.get('entity_type')
        if entity_type:
            qs = qs.filter(entity_type=entity_type)
        return qs

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('department')
    serializer_class = UserSerializer
    def get_permissions(self):
        return [IsAuthenticated()]
    def check_permissions(self, request):
        super().check_permissions(request)
        if not request.user.is_admin_or_librarian:
            self.permission_denied(request, message="Staff role required to manage patrons.")
    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        department = self.request.query_params.get('department')
        if role:
            qs = qs.filter(role=role)
        if department:
            qs = qs.filter(department_id=department)
        if search:
            qs = qs.filter(
                models.Q(reg_number__icontains=search) |
                models.Q(username__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search)
            )
        return qs

    @action(detail=False, methods=['get'], url_path='lookup')
    def lookup_patron(self, request):
        reg = request.query_params.get('reg_number', '').strip()
        if not reg:
            return Response({'error': 'Missing reg_number query parameter.'}, status=status.HTTP_400_BAD_REQUEST)
        cleaned_reg = reg
        if cleaned_reg.startswith('{') and cleaned_reg.endswith('}'):
            try:
                import json
                parsed = json.loads(cleaned_reg)
                cleaned_reg = str(parsed.get('reg_number') or parsed.get('reg_no') or parsed.get('id') or parsed.get('username') or cleaned_reg).strip()
            except Exception:
                pass
        import re
        cleaned_reg = re.sub(
            r'^(REGISTRATION\s*(?:NO|NUM|NUMBER)?|REG\s*(?:NO|NUM|NUMBER)?|STUDENT\s*ID|STAFF\s*ID|PATRON\s*ID|ID)[:\s\-]+',
            '', cleaned_reg, flags=re.IGNORECASE
        ).strip()
        user = User.objects.filter(reg_number__iexact=cleaned_reg).select_related('department').first()
        if not user and cleaned_reg != reg:
            user = User.objects.filter(reg_number__iexact=reg).select_related('department').first()
        if not user:
            user = User.objects.filter(username__iexact=cleaned_reg).select_related('department').first()
        if not user and cleaned_reg != reg:
            user = User.objects.filter(username__iexact=reg).select_related('department').first()
        if not user:
            return Response({'error': f"Patron with ID '{cleaned_reg}' not found in university records."}, status=status.HTTP_404_NOT_FOUND)

        from apps.circulation.models import BorrowRecord
        from apps.fines.models import Fine
        from django.conf import settings
        from django.utils import timezone
        from django.db.models import Sum
        from apps.reservations.models import Reservation
        from apps.circulation.services import CirculationService

        rule = CirculationService.get_circulation_rule(user.role)
        limit = rule.max_checkouts
        active_loans = BorrowRecord.objects.filter(user=user, status=BorrowRecord.Status.ACTIVE).select_related('book_copy')
        active_loans_count = active_loans.count()
        has_overdue = active_loans.filter(due_date__lt=timezone.now()).exists()
        unpaid_fines = Fine.objects.filter(
            user=user, status__in=[Fine.Status.UNPAID, Fine.Status.PARTIALLY_PAID]
        ).aggregate(unpaid=Sum('amount') - Sum('paid_amount'))['unpaid'] or 0.00
        can_borrow = user.is_active_patron and (active_loans_count < limit) and not has_overdue and (unpaid_fines <= 0)
        block_reasons = []
        if not user.is_active_patron:
            reason = f": {user.debarment_reason}" if user.debarment_reason else "."
            block_reasons.append(f"Account is inactive or library privileges are suspended{reason}")
        if active_loans_count >= limit:
            block_reasons.append(f"Reached maximum borrowing limit ({limit} books) under Koha rules.")
        if has_overdue:
            block_reasons.append("Has overdue books requiring return before new checkouts.")
        if unpaid_fines > 0:
            block_reasons.append(f"Outstanding fines of Rs. {float(unpaid_fines):.2f}.")
        waiting_holds = Reservation.objects.filter(
            user=user, status=Reservation.Status.READY_FOR_PICKUP
        ).select_related('allocated_copy')
        serialized = UserSerializer(user).data
        return Response({
            'user': serialized,
            'active_loans_count': active_loans_count,
            'max_borrow_limit': limit,
            'loan_period_days': rule.loan_period_days,
            'has_overdue': has_overdue,
            'outstanding_fines': float(unpaid_fines),
            'can_borrow': can_borrow,
            'block_reasons': block_reasons,
            'waiting_holds': [
                {
                    'id': h.id,
                    'book_title': h.book_title,
                    'accession_number': h.allocated_copy.accession_number if h.allocated_copy else '',
                    'hold_expires_at': h.hold_expires_at
                }
                for h in waiting_holds
            ],
            'current_loans': [
                {
                    'id': l.id,
                    'book_title': l.book_title,
                    'book_isbn': l.book_isbn,
                    'accession_number': l.accession_number,
                    'call_number': '',
                    'item_type': l.item_type,
                    'issue_date': l.issue_date,
                    'due_date': l.due_date,
                    'renewal_count': l.renewal_count,
                    'is_overdue': l.is_currently_overdue,
                    'overdue_days': l.overdue_days
                }
                for l in active_loans
            ]
        })

class BatchCSVImportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.user.role not in [User.Role.ADMIN, User.Role.LIBRARIAN] and not request.user.is_superuser:
            return Response({'error': 'Unauthorized. Admin or Librarian role required.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CSVBatchImportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        csv_file = serializer.validated_data['file']
        target_role = serializer.validated_data['role']
        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'File must have a .csv extension.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            decoded_file = csv_file.read().decode('utf-8-sig')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            created_count = 0
            skipped_count = 0
            errors = []
            for row_idx, row in enumerate(reader, start=1):
                reg_no = (row.get('reg_number') or row.get('username') or '').strip()
                email = (row.get('email') or '').strip()
                first_name = (row.get('first_name') or '').strip()
                last_name = (row.get('last_name') or '').strip()
                dept_name = (row.get('department') or '').strip()
                if not reg_no:
                    errors.append(f"Row {row_idx}: Missing reg_number/username.")
                    continue
                if User.objects.filter(username=reg_no).exists() or User.objects.filter(reg_number=reg_no).exists():
                    skipped_count += 1
                    continue
                department = None
                if dept_name:
                    department, _ = Department.objects.get_or_create(
                        name=dept_name, defaults={'faculty': 'Faculty of Applied Science'}
                    )
                new_user = User(
                    username=reg_no, reg_number=reg_no, email=email,
                    first_name=first_name, last_name=last_name,
                    role=target_role, department=department, is_active_patron=True
                )
                new_user.set_password(reg_no)
                new_user.save()
                created_count += 1
            return Response({
                'message': f'CSV Import completed: {created_count} users created, {skipped_count} skipped.',
                'created_count': created_count, 'skipped_count': skipped_count, 'errors': errors
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to process CSV file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
