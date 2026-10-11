from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet, PlaceReservationView, CancelReservationView

router = DefaultRouter()
router.register(r'queue', ReservationViewSet, basename='reservations-queue')

urlpatterns = [
    path('place/', PlaceReservationView.as_view(), name='place_reservation'),
    path('<int:pk>/cancel/', CancelReservationView.as_view(), name='cancel_reservation'),
    path('', include(router.urls)),
]
