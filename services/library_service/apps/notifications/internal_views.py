from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

def check_internal_api_key(request):
    api_key = request.headers.get('X-Internal-API-Key', '')
    expected_key = getattr(settings, 'INTERNAL_API_KEY', 'dev-internal-api-key-catalog')
    return api_key == expected_key

class InternalCreateNotificationView(APIView):
    permission_classes = []
    authentication_classes = []
    def post(self, request):
        if not check_internal_api_key(request):
            return Response({'error': 'Invalid internal API key'}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get('user_id')
        title = request.data.get('title', '')
        message = request.data.get('message', '')
        notification_type = request.data.get('notification_type', 'GENERAL')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        notif = Notification.objects.create(
            user=user, title=title, message=message, notification_type=notification_type
        )
        return Response({'id': notif.id, 'status': 'created'}, status=status.HTTP_201_CREATED)
