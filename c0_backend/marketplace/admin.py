from django.contrib import admin
from .models import CarbonProject, CreditListing, Transaction


@admin.register(CarbonProject)
class CarbonProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'project_type', 'standard', 'owner', 'total_hectares', 'created_at']
    list_filter = ['project_type', 'standard']
    search_fields = ['name', 'location_text']


@admin.register(CreditListing)
class CreditListingAdmin(admin.ModelAdmin):
    list_display = ['project', 'seller', 'quantity_available', 'price_per_credit', 'status', 'listed_at']
    list_filter = ['status', 'project__project_type']
    search_fields = ['project__name']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['buyer', 'listing', 'quantity_purchased', 'total_price', 'purchased_at']
    list_filter = ['purchased_at']
