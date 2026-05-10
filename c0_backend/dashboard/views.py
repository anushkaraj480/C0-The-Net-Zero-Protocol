from django.db.models import Sum, Count
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from marketplace.models import CarbonProject, CreditListing, Transaction


class DashboardStatsView(APIView):
    """
    GET /api/dashboard/stats/
    Returns aggregate platform stats.
    Matches frontend's DashboardStats interface.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        project_agg = CarbonProject.objects.aggregate(
            total_sequestered_tco2e=Sum('total_sequestered_tco2e'),
            total_hectares=Sum('total_hectares'),
            active_projects=Count('id'),
        )

        active_listings = CreditListing.objects.filter(status='active')
        listing_agg = active_listings.aggregate(
            total_credits_available=Sum('quantity_available'),
            active_listings=Count('id'),
        )

        total_transactions = Transaction.objects.count()

        # Placeholder for MRV sensor count — can be extended later
        active_sensors = 0

        return Response({
            'total_sequestered_tco2e': float(project_agg['total_sequestered_tco2e'] or 0),
            'total_hectares': float(project_agg['total_hectares'] or 0),
            'active_listings': listing_agg['active_listings'] or 0,
            'total_credits_available': listing_agg['total_credits_available'] or 0,
            'total_transactions': total_transactions,
            'active_projects': project_agg['active_projects'] or 0,
            'active_sensors': active_sensors,
        })
