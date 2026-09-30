"""
URL configuration for ulms_core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from .views import api_root

urlpatterns = [
    path('', api_root, name='system-root'),
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    
    # API Endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
    path('api/circulation/', include('apps.circulation.urls')),
    path('api/reservations/', include('apps.reservations.urls')),
    path('api/repository/', include('apps.repository.urls')),
    path('api/fines/', include('apps.fines.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/reports/', include('apps.reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
