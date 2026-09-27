from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, AuthorViewSet, BookViewSet, BookCopyViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'books', BookViewSet)
router.register(r'copies', BookCopyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
