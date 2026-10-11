from django.urls import path
from .internal_views import (
    InternalCopyDetailView,
    InternalCopyStatusUpdateView,
    InternalBookIncrementStatView,
    InternalBookDetailView,
    InternalCopyAvailabilityView,
)

urlpatterns = [
    path('copies/<str:accession>/', InternalCopyDetailView.as_view(), name='internal-copy-detail'),
    path('copies/<int:pk>/status/', InternalCopyStatusUpdateView.as_view(), name='internal-copy-status'),
    path('books/<int:pk>/increment-stat/', InternalBookIncrementStatView.as_view(), name='internal-book-increment-stat'),
    path('books/<int:pk>/', InternalBookDetailView.as_view(), name='internal-book-detail'),
    path('books/<int:book_id>/availability/', InternalCopyAvailabilityView.as_view(), name='internal-copy-availability'),
]
