from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'inbox', NotificationViewSet, basename='notifications-inbox')

urlpatterns = [
    path('', include(router.urls)),
]
