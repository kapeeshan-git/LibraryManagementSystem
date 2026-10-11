from django.urls import path, re_path
from .proxy import proxy_view
from django.http import JsonResponse

def gateway_root(request):
    return JsonResponse({
        'system': 'University of Vavuniya - Library Management System (ULMS)',
        'architecture': 'Microservice Gateway',
        'version': '2.0.0',
        'status': 'Operational',
        'services': {
            'catalog': 'Catalog & E-Books Service',
            'repository': 'Institutional Repository Service',
            'library': 'Library Functions Service (Auth, Circulation, Fines, etc.)',
        },
        'endpoints': {
            'catalog': '/api/catalog/',
            'repository': '/api/repository/',
            'auth': '/api/auth/',
            'circulation': '/api/circulation/',
            'reservations': '/api/reservations/',
            'fines': '/api/fines/',
            'notifications': '/api/notifications/',
            'reports': '/api/reports/',
        }
    })

urlpatterns = [
    path('', gateway_root),
    path('api/', gateway_root),
    # Proxy all API requests to microservices
    re_path(r'^api/catalog/(?P<path>.*)$', proxy_view, {'service': 'catalog'}),
    re_path(r'^api/repository/(?P<path>.*)$', proxy_view, {'service': 'repository'}),
    re_path(r'^api/auth/(?P<path>.*)$', proxy_view, {'service': 'library'}),
    re_path(r'^api/circulation/(?P<path>.*)$', proxy_view, {'service': 'library'}),
    re_path(r'^api/reservations/(?P<path>.*)$', proxy_view, {'service': 'library'}),
    re_path(r'^api/fines/(?P<path>.*)$', proxy_view, {'service': 'library'}),
    re_path(r'^api/notifications/(?P<path>.*)$', proxy_view, {'service': 'library'}),
    re_path(r'^api/reports/(?P<path>.*)$', proxy_view, {'service': 'library'}),
    re_path(r'^api/backups/(?P<path>.*)$', proxy_view, {'service': 'library'}),
    # Media proxy to catalog service
    re_path(r'^media/(?P<path>.*)$', proxy_view, {'service': 'catalog', 'prefix': 'media'}),
]
