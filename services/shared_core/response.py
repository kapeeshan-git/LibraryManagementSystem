from rest_framework.renderers import JSONRenderer
from rest_framework.views import exception_handler

class StandardizedJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = renderer_context['response'].status_code if renderer_context else 200
        
        if data is not None and 'success' in data and 'data' in data:
            return super().render(data, accepted_media_type, renderer_context)
            
        success = 200 <= status_code < 300
        
        response_data = {
            'success': success,
            'data': data if success else None,
            'error': data if not success else None,
            'message': 'Success' if success else 'An error occurred'
        }
        
        if not success and isinstance(data, dict):
            if 'detail' in data:
                response_data['message'] = data.pop('detail')
            response_data['error'] = data

        return super().render(response_data, accepted_media_type, renderer_context)

def standardized_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            'success': False,
            'data': None,
            'error': response.data,
            'message': str(exc)
        }
    return response
