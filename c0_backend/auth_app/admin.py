from django.contrib import admin
from .models import C0User


@admin.register(C0User)
class C0UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'date_joined', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'email']
