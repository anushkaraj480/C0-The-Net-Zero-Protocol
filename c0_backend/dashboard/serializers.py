"""
Dashboard serializers — input validation for the ML estimation endpoint.
"""

from rest_framework import serializers

# ─── Indian State Profiles ───────────────────────────────────────────────────
# Source: India State of Forest Report (ISFR) 2023, MoEFCC
# These MUST match the profiles used in ml_engine/prepare_data.py exactly.
# Format: state → (climate_zone, forest_cover_pct, avg_rainfall_mm, soil_organic_carbon)
STATE_PROFILES = {
    # Tropical Wet — high rainfall, dense forests
    'Kerala':           ('Tropical Wet',        52.3, 3000, 'High'),
    'Goa':              ('Tropical Wet',        60.0, 2900, 'High'),
    'Meghalaya':        ('Tropical Wet',        76.3, 2800, 'High'),
    'Assam':            ('Tropical Wet',        34.2, 2700, 'Medium'),
    'Mizoram':          ('Tropical Wet',        84.5, 2500, 'High'),
    'Nagaland':         ('Tropical Wet',        73.9, 2000, 'High'),
    'Tripura':          ('Tropical Wet',        73.7, 2200, 'Medium'),
    # Tropical Dry / Semi-Arid
    'Maharashtra':      ('Tropical Dry',        16.5, 1100, 'Medium'),
    'Karnataka':        ('Tropical Dry',        20.1, 1300, 'Medium'),
    'Tamil Nadu':       ('Tropical Dry',        17.4, 1000, 'Medium'),
    'Andhra Pradesh':   ('Tropical Dry',        23.0, 900,  'Low'),
    'Telangana':        ('Tropical Dry',        24.0, 950,  'Low'),
    # Arid
    'Rajasthan':        ('Arid',                4.8,  500,  'Very Low'),
    'Gujarat':          ('Arid',                7.6,  800,  'Low'),
    # Subtropical / Himalayan
    'Himachal Pradesh': ('Subtropical',         27.1, 1600, 'Medium'),
    'Uttarakhand':      ('Subtropical',         45.4, 1800, 'High'),
    'Sikkim':           ('Subtropical',         47.3, 2700, 'High'),
    'Arunachal Pradesh': ('Subtropical',        79.3, 2800, 'High'),
    'Manipur':          ('Subtropical',         74.3, 1500, 'Medium'),
    # Humid Subtropical — Indo-Gangetic plains
    'Uttar Pradesh':    ('Humid Subtropical',   6.1,  1000, 'Medium'),
    'Madhya Pradesh':   ('Humid Subtropical',   25.1, 1200, 'Medium'),
    'Bihar':            ('Humid Subtropical',   7.7,  1100, 'Medium'),
    'Punjab':           ('Humid Subtropical',   3.6,  700,  'Medium'),
    'Odisha':           ('Humid Subtropical',   33.2, 1500, 'Medium'),
    'Jharkhand':        ('Humid Subtropical',   29.6, 1300, 'Medium'),
    'Chhattisgarh':     ('Humid Subtropical',   41.1, 1400, 'Medium'),
    'West Bengal':      ('Humid Subtropical',   18.9, 1750, 'Medium'),
    'Haryana':          ('Humid Subtropical',   3.6,  600,  'Low'),
}

VALID_STATES = list(STATE_PROFILES.keys())
VALID_ACTIVITIES = ['Afforestation', 'Reforestation', 'Regenerative Agriculture']
VALID_CLIMATE_ZONES = ['Tropical Wet', 'Tropical Dry', 'Arid', 'Subtropical', 'Humid Subtropical']
VALID_SOC_LEVELS = ['Very Low', 'Low', 'Medium', 'High']


class EstimateRequestSerializer(serializers.Serializer):
    """
    Validates and enriches user input for the ML carbon credit estimator.

    Required fields:
        - land_size_hectares (float): Area of the project
        - activity_type (str): Type of sustainability activity

    Optional fields (auto-filled from state profile if state is provided):
        - state (str): Indian state — triggers auto-fill of climate/rainfall/forest/soc
        - project_age_years (int): Years since project started
        - climate_zone, avg_rainfall_mm, forest_cover_pct, soil_organic_carbon: manual overrides
    """

    # ── Required ──
    land_size_hectares = serializers.FloatField(min_value=1, max_value=10000)
    activity_type = serializers.ChoiceField(choices=[(a, a) for a in VALID_ACTIVITIES])

    # ── Optional (state triggers auto-fill) ──
    state = serializers.ChoiceField(
        choices=[(s, s) for s in VALID_STATES],
        required=False,
        default='Maharashtra'
    )
    project_age_years = serializers.IntegerField(
        min_value=1, max_value=30, required=False, default=5
    )

    # ── Optional overrides (advanced users) ──
    climate_zone = serializers.ChoiceField(
        choices=[(c, c) for c in VALID_CLIMATE_ZONES],
        required=False
    )
    avg_rainfall_mm = serializers.FloatField(
        min_value=100, max_value=5000, required=False
    )
    forest_cover_pct = serializers.FloatField(
        min_value=0, max_value=100, required=False
    )
    soil_organic_carbon = serializers.ChoiceField(
        choices=[(s, s) for s in VALID_SOC_LEVELS],
        required=False
    )

    def validate(self, attrs):
        """Auto-fill climate/rainfall/forest/soc from state profile if not manually overridden."""
        state = attrs.get('state', 'Maharashtra')
        profile = STATE_PROFILES[state]

        # Fill from state profile unless explicitly provided
        if 'climate_zone' not in attrs or not attrs['climate_zone']:
            attrs['climate_zone'] = profile[0]
        if 'avg_rainfall_mm' not in attrs or not attrs['avg_rainfall_mm']:
            attrs['avg_rainfall_mm'] = profile[2]
        if 'forest_cover_pct' not in attrs or not attrs['forest_cover_pct']:
            attrs['forest_cover_pct'] = profile[1]
        if 'soil_organic_carbon' not in attrs or not attrs['soil_organic_carbon']:
            attrs['soil_organic_carbon'] = profile[3]

        return attrs

    def to_model_input(self):
        """Convert validated data into the exact feature dict the ML model expects."""
        data = self.validated_data
        return {
            'land_size_hectares': data['land_size_hectares'],
            'activity_type': data['activity_type'],
            'climate_zone': data['climate_zone'],
            'state': data['state'],
            'project_age_years': data['project_age_years'],
            'avg_rainfall_mm': data['avg_rainfall_mm'],
            'forest_cover_pct': data['forest_cover_pct'],
            'soil_organic_carbon': data['soil_organic_carbon'],
        }
