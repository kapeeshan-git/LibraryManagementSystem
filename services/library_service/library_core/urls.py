"""
URL configuration for Library Functions Microservice.
Handles: Auth, Circulation, Reservations, Fines, Notifications, Reports
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def service_root(request):
    return Response({
        'service': 'Library Functions Microservice',
        'version': '1.0.0',
        'status': 'Operational',
        'domains': ['authentication', 'circulation', 'reservations', 'fines', 'notifications', 'reports'],
    })

urlpatterns = [
    path('', service_root),
    path('admin/', admin.site.urls),

    # Public API endpoints (proxied through gateway)
    path('api/auth/', include('apps.authentication.urls')),
    path('api/circulation/', include('apps.circulation.urls')),
    path('api/reservations/', include('apps.reservations.urls')),
    path('api/fines/', include('apps.fines.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/backups/', include('apps.backups.urls')),

    # Internal API for inter-service communication
    path('internal/', include('apps.notifications.internal_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
