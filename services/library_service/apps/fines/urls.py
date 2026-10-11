from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FineViewSet, RecordPaymentView

router = DefaultRouter()
router.register(r'ledger', FineViewSet, basename='fines-ledger')

urlpatterns = [
    path('pay/', RecordPaymentView.as_view(), name='record_fine_payment'),
    path('', include(router.urls)),
]
