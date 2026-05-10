"""
C0 – Root URL configuration.

Routes:
    /api/auth/       → auth_app
    /api/marketplace/→ marketplace
    /api/dashboard/  → dashboard
    /admin/          → Django admin
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('auth_app.urls')),
    path('api/marketplace/', include('marketplace.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
