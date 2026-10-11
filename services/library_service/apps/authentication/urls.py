from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomLoginView, CurrentUserProfileView,
    DepartmentViewSet, UserManagementViewSet, BatchCSVImportView,
    CustomFieldDefinitionViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'users', UserManagementViewSet, basename='user-management')
router.register(r'custom-fields', CustomFieldDefinitionViewSet, basename='custom-fields')

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', CurrentUserProfileView.as_view(), name='current_user_profile'),
    path('users/batch-import/', BatchCSVImportView.as_view(), name='batch_csv_import'),
    path('', include(router.urls)),
]
