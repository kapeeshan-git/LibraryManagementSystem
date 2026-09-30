from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    return Response({
        'system': 'University of Vavuniya - Library Management System (ULMS)',
        'version': '1.0.0',
        'status': 'Operational',
        'documentation': {
            'frontend_app': 'http://localhost:5173/',
            'django_admin': request.build_absolute_uri('/admin/'),
        },
        'endpoints': {
            'authentication': {
                'login': request.build_absolute_uri('/api/auth/login/'),
                'token_refresh': request.build_absolute_uri('/api/auth/token/refresh/'),
                'current_user': request.build_absolute_uri('/api/auth/profile/'),
                'departments': request.build_absolute_uri('/api/auth/departments/'),
                'users': request.build_absolute_uri('/api/auth/users/'),
                'batch_csv_import': request.build_absolute_uri('/api/auth/users/csv_import/'),
            },
            'catalog': {
                'books': request.build_absolute_uri('/api/catalog/books/'),
                'copies': request.build_absolute_uri('/api/catalog/copies/'),
                'categories': request.build_absolute_uri('/api/catalog/categories/'),
                'authors': request.build_absolute_uri('/api/catalog/authors/'),
                'barcode_lookup': request.build_absolute_uri('/api/catalog/copies/lookup/?barcode=UOV-BC-00001'),
            },
            'circulation': {
                'issue_book': request.build_absolute_uri('/api/circulation/issue/'),
                'return_book': request.build_absolute_uri('/api/circulation/return/'),
                'renew_book': request.build_absolute_uri('/api/circulation/renew/'),
                'my_loans': request.build_absolute_uri('/api/circulation/my-loans/'),
                'borrow_records': request.build_absolute_uri('/api/circulation/records/'),
            },
            'reservations': {
                'place_hold': request.build_absolute_uri('/api/reservations/place/'),
                'my_reservations': request.build_absolute_uri('/api/reservations/my-reservations/'),
                'active_holds': request.build_absolute_uri('/api/reservations/active/'),
            },
            'fines': {
                'ledger': request.build_absolute_uri('/api/fines/ledger/'),
                'pay': request.build_absolute_uri('/api/fines/pay/'),
            },
            'repository': {
                'papers': request.build_absolute_uri('/api/repository/papers/'),
            },
            'reports': {
                'dashboard_metrics': request.build_absolute_uri('/api/reports/dashboard/'),
                'export_circulation_csv': request.build_absolute_uri('/api/reports/export/circulation/'),
                'export_fines_csv': request.build_absolute_uri('/api/reports/export/fines/'),
            }
        }
    })
