from decimal import Decimal
from django.test import TestCase

from auth_app.models import C0User
from .models import CarbonProject, CreditListing, Transaction


class MarketplaceModelTest(TestCase):
    """Basic tests for marketplace models."""

    def setUp(self):
        self.seller = C0User.objects.create_user(
            username='seller', email='seller@test.com', password='pass1234', role='farmer'
        )
        self.buyer = C0User.objects.create_user(
            username='buyer', email='buyer@test.com', password='pass1234', role='buyer'
        )
        self.project = CarbonProject.objects.create(
            owner=self.seller,
            name='Test Forest',
            project_type='reforestation',
            location_text='Amazon, Brazil',
            standard='verra',
            total_hectares=1000,
            total_sequestered_tco2e=50000,
        )
        self.listing = CreditListing.objects.create(
            project=self.project,
            seller=self.seller,
            quantity_available=500,
            price_per_credit=Decimal('15.00'),
        )

    def test_listing_properties(self):
        self.assertEqual(self.listing.project_name, 'Test Forest')
        self.assertEqual(self.listing.seller_email, 'seller@test.com')
        self.assertEqual(self.listing.status, 'active')

    def test_purchase_reduces_quantity(self):
        Transaction.objects.create(
            buyer=self.buyer,
            listing=self.listing,
            quantity_purchased=100,
            total_price=Decimal('1500.00'),
        )
        self.listing.quantity_available -= 100
        self.listing.save()
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.quantity_available, 400)
