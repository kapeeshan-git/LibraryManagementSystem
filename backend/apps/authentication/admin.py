from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Department

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'faculty', 'created_at')
    search_fields = ('name', 'faculty')

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'reg_number', 'email', 'first_name', 'last_name', 'role', 'department', 'is_active_patron')
    list_filter = ('role', 'department', 'is_active_patron', 'is_staff')
    search_fields = ('username', 'reg_number', 'email', 'first_name', 'last_name')
    fieldsets = UserAdmin.fieldsets + (
        ('Library Patron Information', {
            'fields': ('role', 'reg_number', 'department', 'phone_number', 'is_active_patron'),
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Library Patron Information', {
            'fields': ('role', 'reg_number', 'department', 'phone_number', 'is_active_patron'),
        }),
    )
