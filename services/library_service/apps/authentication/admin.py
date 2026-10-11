from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Department

admin.site.register(Department)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'reg_number', 'role', 'email', 'is_active_patron']
    list_filter = ['role', 'is_active_patron']
    search_fields = ['username', 'reg_number', 'email', 'first_name', 'last_name']
