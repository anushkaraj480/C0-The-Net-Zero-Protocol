"""
Management command to seed the database with sample data for development.
Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from auth_app.models import C0User
from marketplace.models import CarbonProject, CreditListing


SAMPLE_PROJECTS = [
    {
        'name': 'Western Ghats Reforestation',
        'project_type': 'reforestation',
        'location_text': 'Karnataka, India',
        'description': 'Restoration and protection of degraded forest ecosystems in the Western Ghats biodiversity hotspot.',
        'standard': 'verra',
        'total_hectares': 15000,
        'total_sequestered_tco2e': 450000,
    },
    {
        'name': 'Punjab Regenerative Farming',
        'project_type': 'soil_carbon',
        'location_text': 'Punjab, India',
        'description': 'Regenerative agricultural practices and organic carbon enhancement across farms in Punjab.',
        'standard': 'gold_standard',
        'total_hectares': 8500,
        'total_sequestered_tco2e': 120000,
    },
    {
        'name': 'Bhadla Solar Park',
        'project_type': 'renewable_energy',
        'location_text': 'Rajasthan, India',
        'description': 'Massive solar installation displacing grid electricity with clean solar energy in the Thar desert.',
        'standard': 'verra',
        'total_hectares': 400,
        'total_sequestered_tco2e': 380000,
    },
    {
        'name': 'Sundarbans Mangrove Restoration',
        'project_type': 'blue_carbon',
        'location_text': 'West Bengal, India',
        'description': 'Restoring mangrove ecosystems in the Sundarbans region to protect coastlines and sequester blue carbon.',
        'standard': 'gold_standard',
        'total_hectares': 3000,
        'total_sequestered_tco2e': 95000,
    },
    {
        'name': 'Mumbai Biogas Methane Capture',
        'project_type': 'methane_capture',
        'location_text': 'Maharashtra, India',
        'description': 'Methane recovery and bio-CNG generation from municipal solid waste facilities in Mumbai.',
        'standard': 'acr',
        'total_hectares': 50,
        'total_sequestered_tco2e': 210000,
    },
    {
        'name': 'Mundra DAC Facility',
        'project_type': 'direct_air_capture',
        'location_text': 'Gujarat, India',
        'description': 'Pilot direct air capture facility storing carbon dioxide permanently in saline aquifers.',
        'standard': 'puro',
        'total_hectares': 10,
        'total_sequestered_tco2e': 36000,
    },
]

LISTING_PRICES = [12.50, 18.75, 22.00, 35.00, 8.90, 150.00]
LISTING_QUANTITIES = [5000, 3200, 10000, 1500, 8000, 500]


class Command(BaseCommand):
    help = 'Seed the database with sample carbon projects and listings.'

    def handle(self, *args, **options):
        # Create or update demo seller
        seller, created = C0User.objects.get_or_create(
            username='demo_seller',
            defaults={
                'email': 'seller@c0protocol.io',
                'role': 'farmer',
            },
        )
        seller.set_password('demo1234')
        seller.is_staff = True
        seller.is_superuser = True
        seller.save()
        self.stdout.write(self.style.SUCCESS('Created/updated demo seller user with superuser permissions.'))

        # Create or update demo buyer
        buyer, created = C0User.objects.get_or_create(
            username='demo_buyer',
            defaults={
                'email': 'buyer@c0protocol.io',
                'role': 'buyer',
            },
        )
        buyer.set_password('demo1234')
        buyer.is_staff = True
        buyer.is_superuser = True
        buyer.save()
        self.stdout.write(self.style.SUCCESS('Created/updated demo buyer user with superuser permissions.'))

        # Create projects and listings
        for i, proj_data in enumerate(SAMPLE_PROJECTS):
            project, created = CarbonProject.objects.get_or_create(
                name=proj_data['name'],
                defaults={**proj_data, 'owner': seller},
            )
            if created:
                CreditListing.objects.create(
                    project=project,
                    seller=seller,
                    quantity_available=LISTING_QUANTITIES[i],
                    price_per_credit=LISTING_PRICES[i],
                    status='active',
                )
                self.stdout.write(self.style.SUCCESS(f'  Created: {project.name}'))
            else:
                self.stdout.write(f'  Skipped (exists): {project.name}')

        self.stdout.write(self.style.SUCCESS('\nSeed data complete.'))
