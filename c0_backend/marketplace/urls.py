from django.urls import path
from . import views

urlpatterns = [
    path('listings/', views.ListingListView.as_view(), name='listing-list'),
    path('listings/<int:pk>/', views.ListingDetailView.as_view(), name='listing-detail'),
    path('buy/', views.BuyCreditsView.as_view(), name='buy-credits'),
    path('my-transactions/', views.MyTransactionsView.as_view(), name='my-transactions'),
    path('trends/', views.TrendsView.as_view(), name='market-trends'),
]
