from django.urls import path
from .internal_views import InternalCreateNotificationView

urlpatterns = [
    path('notifications/create/', InternalCreateNotificationView.as_view(), name='internal-create-notification'),
]
