import requests
from django.http import HttpResponse, StreamingHttpResponse
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Service URL mapping
SERVICE_URLS = {
    'catalog': lambda: getattr(settings, 'CATALOG_SERVICE_URL', 'http://127.0.0.1:8001'),
    'repository': lambda: getattr(settings, 'REPOSITORY_SERVICE_URL', 'http://127.0.0.1:8002'),
    'library': lambda: getattr(settings, 'LIBRARY_SERVICE_URL', 'http://127.0.0.1:8003'),
}

# URL prefix mapping (what to prepend when forwarding)
SERVICE_PREFIXES = {
    'catalog': '/api/catalog/',
    'repository': '/api/repository/',
    'library': '/api/',  # Library service handles auth, circulation, etc. under /api/
}

def proxy_view(request, path='', service='library', prefix=None):
    """
    Forward the incoming request to the appropriate microservice.
    Preserves headers, query params, body, and method.
    """
    service_url_fn = SERVICE_URLS.get(service)
    if not service_url_fn:
        return HttpResponse(f'Unknown service: {service}', status=502)

    base_url = service_url_fn()

    # Build the target URL
    if prefix:
        # For media proxy
        target_url = f"{base_url}/{prefix}/{path}"
    else:
        # Reconstruct the original API path
        # The request originally came as /api/<service_prefix>/<path>
        # We need to forward it as /api/<service_prefix>/<path> to the service
        original_prefix = request.path.split('/api/')[1].split('/')[0] if '/api/' in request.path else ''
        target_url = f"{base_url}/api/{original_prefix}/{path}"

    # Preserve query string
    if request.META.get('QUERY_STRING'):
        target_url += f"?{request.META['QUERY_STRING']}"

    # Forward headers (exclude hop-by-hop headers)
    headers = {}
    for key, value in request.META.items():
        if key.startswith('HTTP_'):
            header_name = key[5:].replace('_', '-').title()
            if header_name.lower() not in ('host', 'connection', 'keep-alive', 'transfer-encoding', 'te', 'trailer', 'upgrade'):
                headers[header_name] = value
    
    # Forward Content-Type
    if request.content_type:
        headers['Content-Type'] = request.content_type

    # JWT Decoding and Header Injection for microservices
    auth_header = headers.get('Authorization', '')
    if auth_header.startswith('Bearer ') and service in ['catalog', 'repository']:
        token = auth_header.split(' ')[1]
        try:
            import jwt
            import os
            # Use the library service's secret key for verification
            secret = os.environ.get('SECRET_KEY', 'django-insecure-library-service-dev-key')
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            
            headers['X-User-Id'] = str(payload.get('user_id', ''))
            headers['X-User-Role'] = payload.get('role', '')
            headers['X-User-IsStaff'] = str(payload.get('is_staff', False)).lower()
            headers['X-User-IsAdmin'] = str(payload.get('is_superuser', False)).lower()
            headers['X-User-Username'] = payload.get('username', '')
            headers['X-User-FullName'] = payload.get('full_name', '')
            headers['X-User-RegNumber'] = payload.get('reg_number', '')
            headers['X-User-Department'] = payload.get('department', '')
            
            # Remove Authorization header so downstream services don't fail trying to decode it
            # with their own (potentially different or missing) auth configurations.
            headers.pop('Authorization')
            print(f'INJECTED HEADERS: {headers}')
        except Exception as e:
            logger.warning(f"Gateway JWT decoding failed: {e}")
            # If token is invalid, we strip it anyway so downstream treats it as unauthenticated
            headers.pop('Authorization', None)

    try:
        # Forward the request
        method = request.method.lower()
        request_kwargs = {
            'headers': headers,
            'timeout': 30,
            'allow_redirects': False,
        }

        # Handle body for non-GET requests
        if method in ('post', 'put', 'patch', 'delete'):
            content_type = request.content_type or ''
            if 'multipart' in content_type:
                # Forward files and data separately for multipart
                request_kwargs['data'] = request.POST.dict()
                request_kwargs['files'] = {name: (f.name, f, f.content_type) for name, f in request.FILES.items()}
                # Remove Content-Type to let requests set it with boundary
                headers.pop('Content-Type', None)
                request_kwargs['headers'] = headers
            else:
                request_kwargs['data'] = request.body

        resp = getattr(requests, method)(target_url, **request_kwargs)

        # Build Django response
        content_type_resp = resp.headers.get('Content-Type', 'application/json')
        
        if 'text/csv' in content_type_resp or 'application/pdf' in content_type_resp or 'application/octet-stream' in content_type_resp:
            # Stream binary responses
            django_response = HttpResponse(
                resp.content,
                status=resp.status_code,
                content_type=content_type_resp
            )
        else:
            django_response = HttpResponse(
                resp.content,
                status=resp.status_code,
                content_type=content_type_resp
            )

        # Forward response headers
        for header_name in ('Content-Disposition', 'X-Total-Count', 'Link'):
            if header_name in resp.headers:
                django_response[header_name] = resp.headers[header_name]

        return django_response

    except requests.exceptions.ConnectionError:
        logger.error(f"Service '{service}' at {base_url} is not reachable.")
        return HttpResponse(
            f'{{"error": "Service \'{service}\' is temporarily unavailable. Please try again later."}}',
            status=503,
            content_type='application/json'
        )
    except requests.exceptions.Timeout:
        return HttpResponse(
            f'{{"error": "Service \'{service}\' request timed out."}}',
            status=504,
            content_type='application/json'
        )
    except Exception as e:
        logger.exception(f"Proxy error for service '{service}': {e}")
        return HttpResponse(
            f'{{"error": "Gateway error: {str(e)}"}}',
            status=502,
            content_type='application/json'
        )

