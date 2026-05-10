from django.db.models import Avg
from django.db.models.functions import TruncMonth
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CreditListing, Transaction
from .serializers import (
    CreditListingSerializer,
    BuyCreditsSerializer,
    TransactionSerializer,
)


class ListingListView(generics.ListAPIView):
    """
    GET /api/marketplace/listings/
    Returns all active credit listings.
    Supports filtering by project_type, standard, search, ordering.
    """

    serializer_class = CreditListingSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['status']
    search_fields = ['project__name', 'project__location_text', 'project__description']
    ordering_fields = ['price_per_credit', 'quantity_available', 'listed_at']

    def get_queryset(self):
        qs = CreditListing.objects.select_related('project', 'seller').filter(status='active')
        project_type = self.request.query_params.get('project_type')
        standard = self.request.query_params.get('standard')
        if project_type:
            qs = qs.filter(project__project_type=project_type)
        if standard:
            qs = qs.filter(project__standard=standard)
        return qs


class ListingDetailView(generics.RetrieveAPIView):
    """GET /api/marketplace/listings/<id>/"""

    queryset = CreditListing.objects.select_related('project', 'seller')
    serializer_class = CreditListingSerializer
    permission_classes = [permissions.AllowAny]


class BuyCreditsView(APIView):
    """
    POST /api/marketplace/buy/
    Purchase credits from a listing.
    Expects { listing: <id>, quantity_purchased: <int> }.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = BuyCreditsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        listing_id = serializer.validated_data['listing']
        qty = serializer.validated_data['quantity_purchased']

        try:
            listing = CreditListing.objects.get(id=listing_id, status='active')
        except CreditListing.DoesNotExist:
            return Response(
                {'detail': 'Listing not found or not active.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if qty > listing.quantity_available:
            return Response(
                {'detail': 'Insufficient credits available.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_price = qty * listing.price_per_credit

        transaction = Transaction.objects.create(
            buyer=request.user,
            listing=listing,
            quantity_purchased=qty,
            total_price=total_price,
        )

        listing.quantity_available -= qty
        if listing.quantity_available == 0:
            listing.status = 'sold'
        listing.save()

        return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)


class MyTransactionsView(generics.ListAPIView):
    """GET /api/marketplace/my-transactions/"""

    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(buyer=self.request.user)


class TrendsView(APIView):
    """
    GET /api/marketplace/trends/
    Returns monthly average price by project type.
    Matches frontend's TrendPoint[] interface.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        trends = (
            CreditListing.objects
            .select_related('project')
            .annotate(month=TruncMonth('listed_at'))
            .values('month', 'project__project_type')
            .annotate(avg_price=Avg('price_per_credit'))
            .order_by('month')
        )

        data = [
            {
                'month': t['month'].strftime('%Y-%m'),
                'project_type': t['project__project_type'],
                'avg_price': float(t['avg_price']),
            }
            for t in trends
        ]

        return Response(data)
