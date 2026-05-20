from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('estimate/', views.EstimateGenerationView.as_view(), name='dashboard-estimate'),
    path('model-status/', views.ModelStatusView.as_view(), name='model-status'),
]
