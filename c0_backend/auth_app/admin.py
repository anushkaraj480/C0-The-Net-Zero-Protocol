from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import C0User


@admin.register(C0User)
class C0UserAdmin(UserAdmin):
    """
    Custom admin for C0User that inherits from Django's UserAdmin.
    This ensures proper password hashing when creating/editing users
    through the admin panel, and provides the standard password
    change form.
    """

    # List view
    list_display = ['username', 'email', 'role', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email', 'company_name']
    ordering = ['-date_joined']

    # Add custom fields to the standard UserAdmin fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('C0 Profile', {
            'fields': ('role', 'phone', 'location', 'pincode', 'company_name'),
        }),
    )

    # Fields shown when creating a new user via admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('C0 Profile', {
            'fields': ('email', 'role', 'phone', 'location', 'pincode', 'company_name'),
        }),
    )
