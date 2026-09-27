from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Department
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    DepartmentSerializer,
    CSVBatchImportSerializer
)
import csv
import io

User = get_user_model()

class CustomLoginView(TokenObtainPairView):
    """Custom JWT login returning tokens and patron info."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class CurrentUserProfileView(APIView):
    """Fetch profile data of currently authenticated user."""
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


class UserManagementViewSet(viewsets.ModelViewSet):
    """Admin/Librarian patron management."""
    queryset = User.objects.all().select_related('department')
    serializer_class = UserSerializer

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
            qs = qs.filter(reg_number__icontains=search) | qs.filter(username__icontains=search) | qs.filter(first_name__icontains=search) | qs.filter(last_name__icontains=search)
        return qs


class BatchCSVImportView(APIView):
    """CSV batch patron import for annual student intake & faculty onboarding."""
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
                        name=dept_name,
                        defaults={'faculty': 'Faculty of Applied Science'}
                    )

                new_user = User(
                    username=reg_no,
                    reg_number=reg_no,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    role=target_role,
                    department=department,
                    is_active_patron=True
                )
                # Set initial password to reg_number
                new_user.set_password(reg_no)
                new_user.save()
                created_count += 1

            return Response({
                'message': f'CSV Import completed: {created_count} users created, {skipped_count} skipped.',
                'created_count': created_count,
                'skipped_count': skipped_count,
                'errors': errors
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Failed to process CSV file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
