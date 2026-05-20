from django.db import models
from django.conf import settings


class CarbonProject(models.Model):
    """A carbon sequestration / offset project."""

    PROJECT_TYPES = [
        ('reforestation', 'Reforestation'),
        ('soil_carbon', 'Soil Carbon'),
        ('renewable_energy', 'Renewable Energy'),
        ('methane_capture', 'Methane Capture'),
        ('blue_carbon', 'Blue Carbon'),
        ('direct_air_capture', 'Direct Air Capture'),
    ]

    STANDARDS = [
        ('verra', 'Verra VCS'),
        ('gold_standard', 'Gold Standard'),
        ('acr', 'ACR'),
        ('car', 'CAR'),
        ('puro', 'Puro.earth'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects',
    )
    name = models.CharField(max_length=200)
    project_type = models.CharField(max_length=30, choices=PROJECT_TYPES)
    location_text = models.CharField(max_length=300)
    description = models.TextField(blank=True, default='')
    standard = models.CharField(max_length=30, choices=STANDARDS)
    total_hectares = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_sequestered_tco2e = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'carbon_projects'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class CreditListing(models.Model):
    """
    A marketplace listing for carbon credits.
    Matches the frontend's Listing interface.
    """

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold Out'),
        ('expired', 'Expired'),
    ]

    project = models.ForeignKey(
        CarbonProject,
        on_delete=models.CASCADE,
        related_name='listings',
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='listings',
    )
    quantity_available = models.PositiveIntegerField()
    price_per_credit = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    listed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'credit_listings'
        ordering = ['-listed_at']

    def __str__(self):
        return f"{self.project.name} – {self.quantity_available} credits @ ${self.price_per_credit}"

    # Computed properties matching the frontend interface
    @property
    def project_name(self):
        return self.project.name

    @property
    def project_type(self):
        return self.project.project_type

    @property
    def location_text(self):
        return self.project.location_text

    @property
    def description(self):
        return self.project.description

    @property
    def standard(self):
        return self.project.standard

    @property
    def available(self):
        return str(self.quantity_available)

    @property
    def price(self):
        return str(self.price_per_credit)

    @property
    def seller_email(self):
        return self.seller.email


class Transaction(models.Model):
    """Records a credit purchase."""

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='purchases',
    )
    listing = models.ForeignKey(
        CreditListing,
        on_delete=models.CASCADE,
        related_name='transactions',
    )
    quantity_purchased = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-purchased_at']

    def __str__(self):
        return f"{self.buyer.username} bought {self.quantity_purchased} from {self.listing}"


class MarketDataSnapshot(models.Model):
    """Historical snapshot of market data scraped from external sources (e.g., IEX)."""
    
    date = models.DateField(unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Market Clearing Price / REC price
    volume = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'market_data_snapshots'
        ordering = ['date']

    def __str__(self):
        return f"Market Data on {self.date}: {self.price}"
