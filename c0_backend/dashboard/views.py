"""
Dashboard views — platform stats, ML estimation, and model health check.
"""

import os
import threading

import joblib
import pandas as pd
from django.conf import settings
from django.db.models import Sum, Count
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from marketplace.models import CarbonProject, CreditListing, Transaction
from .serializers import (
    EstimateRequestSerializer,
    STATE_PROFILES,
    VALID_STATES,
    VALID_ACTIVITIES,
    VALID_CLIMATE_ZONES,
    VALID_SOC_LEVELS,
)


# ─── Lazy Model Loader (thread-safe singleton) ───────────────────────────────
# The model is ~25 MB — load it once on first request, not at Django startup.

_model = None
_model_lock = threading.Lock()
_model_error = None

MODEL_PATH = os.path.join(
    settings.BASE_DIR.parent, 'ml_engine', 'models', 'c0_estimator.pkl'
)


def get_model():
    """Thread-safe lazy loader for the trained ML pipeline."""
    global _model, _model_error
    if _model is not None:
        return _model

    with _model_lock:
        # Double-check after acquiring lock
        if _model is not None:
            return _model
        try:
            _model = joblib.load(MODEL_PATH)
            _model_error = None
        except Exception as e:
            _model_error = str(e)
            _model = None
    return _model


# ─── Dashboard Stats ─────────────────────────────────────────────────────────

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


# ─── ML Carbon Credit Estimator ─────────────────────────────────────────────

class EstimateGenerationView(APIView):
    """
    POST /api/dashboard/estimate/

    Accepts project parameters, auto-fills missing features from Indian state
    profiles, runs the trained Random Forest model, and returns a rich response.

    Required body params:
        - land_size_hectares (float)
        - activity_type (str): "Afforestation" | "Reforestation" | "Regenerative Agriculture"

    Optional body params:
        - state (str): Indian state name — auto-fills climate/rainfall/forest/soc
        - project_age_years (int): 1–30, default 5
        - climate_zone, avg_rainfall_mm, forest_cover_pct, soil_organic_carbon: manual overrides
    """

    permission_classes = [AllowAny]

    def post(self, request):
        model = get_model()
        if model is None:
            return Response({
                'error': 'ML model not loaded',
                'detail': _model_error or f'Model file not found at {MODEL_PATH}',
            }, status=503)

        serializer = EstimateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Invalid input',
                'details': serializer.errors,
            }, status=400)

        # Build the feature dict (serializer auto-fills from state profile)
        model_input = serializer.to_model_input()

        try:
            actual_land_size = model_input['land_size_hectares']

            # The training data maxes at ~500 ha.  For larger plots
            # we predict at 500 ha and scale linearly, because carbon
            # sequestration is roughly proportional to land area.
            TRAINING_MAX_HA = 500.0
            if actual_land_size > TRAINING_MAX_HA:
                model_input_scaled = {**model_input, 'land_size_hectares': TRAINING_MAX_HA}
                input_df = pd.DataFrame([model_input_scaled])
                base_prediction = model.predict(input_df)[0]
                scale_factor = actual_land_size / TRAINING_MAX_HA
                prediction = base_prediction * scale_factor
            else:
                input_df = pd.DataFrame([model_input])
                prediction = model.predict(input_df)[0]

            estimated_credits = max(0, round(prediction, 2))

            # Revenue in INR — India voluntary carbon market rate
            price_per_ton_inr = 1250  # ₹1,250 per tCO2e

            return Response({
                'estimated_credits': estimated_credits,
                'revenue_potential': round(estimated_credits * price_per_ton_inr, 2),
                'price_per_ton_inr': price_per_ton_inr,
                'currency': 'INR',
                'model_inputs_used': {**model_input, 'land_size_hectares': actual_land_size},
                'confidence_note': (
                    'Estimate based on India-calibrated Random Forest model '
                    '(200 trees, trained on ISFR 2023 / OWID / World Bank data)'
                ),
            })
        except Exception as e:
            return Response({
                'error': 'Prediction failed',
                'detail': str(e),
            }, status=500)


# ─── Model Health Check ──────────────────────────────────────────────────────

class ModelStatusView(APIView):
    """
    GET /api/dashboard/model-status/
    Returns the current state of the ML model and its supported inputs.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        model = get_model()
        model_size_mb = None
        if os.path.exists(MODEL_PATH):
            model_size_mb = round(os.path.getsize(MODEL_PATH) / (1024 * 1024), 1)

        return Response({
            'model_loaded': model is not None,
            'model_path': MODEL_PATH,
            'model_size_mb': model_size_mb,
            'error': _model_error,
            'supported_features': [
                'land_size_hectares', 'activity_type', 'climate_zone',
                'state', 'project_age_years', 'avg_rainfall_mm',
                'forest_cover_pct', 'soil_organic_carbon',
            ],
            'supported_states': VALID_STATES,
            'supported_activities': VALID_ACTIVITIES,
            'supported_climate_zones': VALID_CLIMATE_ZONES,
            'supported_soc_levels': VALID_SOC_LEVELS,
            'state_profiles': {
                state: {
                    'climate_zone': profile[0],
                    'forest_cover_pct': profile[1],
                    'avg_rainfall_mm': profile[2],
                    'soil_organic_carbon': profile[3],
                }
                for state, profile in STATE_PROFILES.items()
            },
        })
