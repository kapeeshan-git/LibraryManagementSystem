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
        'service': 'Institutional Repository Microservice',
        'version': '1.0.0',
        'status': 'Operational',
    })

urlpatterns = [
    path('', service_root),
    path('admin/', admin.site.urls),
    path('api/repository/', include('apps.repository.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
