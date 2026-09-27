from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IssueBookView, ReturnBookView, RenewBookView, BorrowRecordViewSet

router = DefaultRouter()
router.register(r'records', BorrowRecordViewSet, basename='borrow-records')

urlpatterns = [
    path('issue/', IssueBookView.as_view(), name='circulation_issue'),
    path('return/', ReturnBookView.as_view(), name='circulation_return'),
    path('renew/', RenewBookView.as_view(), name='circulation_renew'),
    path('', include(router.urls)),
]
