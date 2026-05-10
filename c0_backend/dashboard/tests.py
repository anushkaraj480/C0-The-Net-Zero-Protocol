from django.test import TestCase, RequestFactory

from auth_app.models import C0User
from marketplace.models import CarbonProject, CreditListing
from .views import DashboardStatsView


class DashboardStatsTest(TestCase):
    """Test the dashboard stats endpoint returns correct aggregates."""

    def setUp(self):
        self.factory = RequestFactory()
        seller = C0User.objects.create_user(
            username='seller', email='s@test.com', password='pass1234'
        )
        project = CarbonProject.objects.create(
            owner=seller,
            name='Test Project',
            project_type='reforestation',
            location_text='Test',
            standard='verra',
            total_hectares=100,
            total_sequestered_tco2e=5000,
        )
        CreditListing.objects.create(
            project=project,
            seller=seller,
            quantity_available=200,
            price_per_credit=10.00,
        )

    def test_stats_returns_data(self):
        request = self.factory.get('/api/dashboard/stats/')
        view = DashboardStatsView.as_view()
        response = view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['active_projects'], 1)
        self.assertEqual(response.data['total_credits_available'], 200)
