from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IssueBookView, 
    ReturnBookView, 
    RenewBookView, 
    BorrowRecordViewSet,
    CirculationRuleViewSet,
    OverdueLoansView
)

router = DefaultRouter()
router.register(r'records', BorrowRecordViewSet, basename='borrow-records')
router.register(r'rules', CirculationRuleViewSet, basename='circulation-rules')

urlpatterns = [
    path('issue/', IssueBookView.as_view(), name='circulation_issue'),
    path('return/', ReturnBookView.as_view(), name='circulation_return'),
    path('renew/', RenewBookView.as_view(), name='circulation_renew'),
    path('overdues/', OverdueLoansView.as_view(), name='circulation_overdues'),
    path('', include(router.urls)),
]
