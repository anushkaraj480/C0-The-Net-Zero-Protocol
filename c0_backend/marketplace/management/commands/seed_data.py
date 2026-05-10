"""
Management command to seed the database with sample data for development.
Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from auth_app.models import C0User
from marketplace.models import CarbonProject, CreditListing


SAMPLE_PROJECTS = [
    {
        'name': 'Amazon Reforestation Initiative',
        'project_type': 'reforestation',
        'location_text': 'Amazonas, Brazil',
        'description': 'Large-scale reforestation of degraded Amazon rainforest areas, restoring biodiversity and sequestering carbon.',
        'standard': 'verra',
        'total_hectares': 15000,
        'total_sequestered_tco2e': 450000,
    },
    {
        'name': 'Midwest Soil Carbon Program',
        'project_type': 'soil_carbon',
        'location_text': 'Iowa, USA',
        'description': 'Regenerative agriculture practices across 500 farms to increase soil organic carbon.',
        'standard': 'gold_standard',
        'total_hectares': 8500,
        'total_sequestered_tco2e': 120000,
    },
    {
        'name': 'Rajasthan Solar Farm',
        'project_type': 'renewable_energy',
        'location_text': 'Rajasthan, India',
        'description': '200 MW solar installation displacing coal-fired electricity generation.',
        'standard': 'verra',
        'total_hectares': 400,
        'total_sequestered_tco2e': 380000,
    },
    {
        'name': 'Kenya Mangrove Restoration',
        'project_type': 'blue_carbon',
        'location_text': 'Lamu, Kenya',
        'description': 'Restoring 3,000 hectares of mangrove forests along the Kenyan coast.',
        'standard': 'gold_standard',
        'total_hectares': 3000,
        'total_sequestered_tco2e': 95000,
    },
    {
        'name': 'Alberta Methane Capture',
        'project_type': 'methane_capture',
        'location_text': 'Alberta, Canada',
        'description': 'Capturing methane from oil and gas operations and converting to energy.',
        'standard': 'acr',
        'total_hectares': 50,
        'total_sequestered_tco2e': 210000,
    },
    {
        'name': 'Iceland DAC Facility',
        'project_type': 'direct_air_capture',
        'location_text': 'Hellisheiði, Iceland',
        'description': 'Direct air capture plant storing CO₂ as mineral carbonates underground.',
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
        # Create a demo seller
        seller, created = C0User.objects.get_or_create(
            username='demo_seller',
            defaults={
                'email': 'seller@c0protocol.io',
                'role': 'farmer',
            },
        )
        if created:
            seller.set_password('demo1234')
            seller.save()
            self.stdout.write(self.style.SUCCESS('Created demo seller user.'))

        # Create a demo buyer
        buyer, created = C0User.objects.get_or_create(
            username='demo_buyer',
            defaults={
                'email': 'buyer@c0protocol.io',
                'role': 'buyer',
            },
        )
        if created:
            buyer.set_password('demo1234')
            buyer.save()
            self.stdout.write(self.style.SUCCESS('Created demo buyer user.'))

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

        self.stdout.write(self.style.SUCCESS('\n✓ Seed data complete.'))
