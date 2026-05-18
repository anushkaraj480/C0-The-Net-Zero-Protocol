import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

print("🚀 Loading datasets...")
# Load the downloaded OWID dataset (used as reference context)
owid_df = pd.read_csv('data/land_use_emissions.csv')

# Filter OWID data to India only (for reference/context logging)
india_df = owid_df[owid_df['country'] == 'India']
if not india_df.empty:
    latest = india_df[india_df['year'] == india_df['year'].max()].iloc[0]
    print(f"📊 India reference context — Year: {int(latest['year'])}, "
          f"CO2 (Mt): {latest.get('co2', 'N/A')}, "
          f"Land-use change CO2 (Mt): {latest.get('land_use_change_co2', 'N/A')}")

# ---------------------------------------------------------------------------
# Synthesize India-specific training data for C0 carbon credit estimation
# Activity types: Afforestation, Reforestation, Regenerative Agriculture
# Climate zones and states mapped to real Indian geography
# ---------------------------------------------------------------------------
print("📝 Synthesizing India-specific training dataset...")

np.random.seed(42)
n_samples = 3000

# Indian states grouped by dominant climate zone
state_climate_map = {
    # Tropical Wet
    'Kerala': 'Tropical Wet',
    'Goa': 'Tropical Wet',
    'Meghalaya': 'Tropical Wet',
    'Assam': 'Tropical Wet',
    'Mizoram': 'Tropical Wet',
    # Tropical Dry / Semi-Arid
    'Maharashtra': 'Tropical Dry',
    'Karnataka': 'Tropical Dry',
    'Tamil Nadu': 'Tropical Dry',
    'Andhra Pradesh': 'Tropical Dry',
    'Telangana': 'Tropical Dry',
    # Arid
    'Rajasthan': 'Arid',
    'Gujarat': 'Arid',
    'Kutch': 'Arid',
    # Subtropical / Temperate (Himalayan belt)
    'Himachal Pradesh': 'Subtropical',
    'Uttarakhand': 'Subtropical',
    'Sikkim': 'Subtropical',
    'Arunachal Pradesh': 'Subtropical',
    # Humid Subtropical (Indo-Gangetic plains)
    'Uttar Pradesh': 'Humid Subtropical',
    'Madhya Pradesh': 'Humid Subtropical',
    'Bihar': 'Humid Subtropical',
    'Punjab': 'Humid Subtropical',
    'Odisha': 'Humid Subtropical',
    'Jharkhand': 'Humid Subtropical',
    'Chhattisgarh': 'Humid Subtropical',
    'West Bengal': 'Humid Subtropical',
}

states = list(state_climate_map.keys())
activity_types = ['Afforestation', 'Reforestation', 'Regenerative Agriculture']

# Generate random samples
sampled_states = np.random.choice(states, n_samples)
sampled_activities = np.random.choice(activity_types, n_samples)
sampled_land_sizes = np.random.uniform(5, 500, n_samples)  # hectares

climate_zones = [state_climate_map[s] for s in sampled_states]

df = pd.DataFrame({
    'state': sampled_states,
    'climate_zone': climate_zones,
    'activity_type': sampled_activities,
    'land_size_hectares': sampled_land_sizes,
})

# ---------------------------------------------------------------------------
# Carbon credit estimation logic (tCO2e per hectare per year, India-calibrated)
#
#   Afforestation        — new forest on barren/degraded land
#   Reforestation        — replanting on previously forested land
#   Regenerative Agri    — soil carbon through cover crops, no-till, etc.
#
# Base sequestration rates (tCO2e / hectare / year) from Indian forestry studies:
#   Afforestation:              6–12 tCO2e/ha/yr (avg ~8)
#   Reforestation:              8–15 tCO2e/ha/yr (avg ~10, faster canopy)
#   Regenerative Agriculture:   1.5–4 tCO2e/ha/yr (avg ~2.5)
# ---------------------------------------------------------------------------

base_rates = {
    'Afforestation': 8.0,
    'Reforestation': 10.0,
    'Regenerative Agriculture': 2.5,
}

# Climate zone multipliers (how much climate amplifies/reduces sequestration)
climate_multipliers = {
    'Tropical Wet': 1.35,       # Heavy rainfall, fast biomass growth
    'Tropical Dry': 1.0,        # Baseline
    'Arid': 0.55,               # Low water availability, slow growth
    'Subtropical': 1.15,        # Moderate altitude forests, good growth
    'Humid Subtropical': 1.10,  # Fertile plains, decent moisture
}

def estimate_credits(row):
    base = base_rates[row['activity_type']]
    climate_factor = climate_multipliers[row['climate_zone']]
    land = row['land_size_hectares']
    # Add realistic noise (±5% variance)
    noise = np.random.normal(0, base * 0.05 * land * climate_factor * 0.1)
    return round(land * base * climate_factor + noise, 2)

df['estimated_carbon_credits_tco2e'] = df.apply(estimate_credits, axis=1)

print(f"✅ Generated {len(df)} India-specific training samples")
print(f"   Activity types : {', '.join(activity_types)}")
print(f"   States covered : {len(states)}")
print(f"   Climate zones  : {', '.join(set(climate_zones))}")
print(f"\n📈 Sample statistics:")
print(df.groupby('activity_type')['estimated_carbon_credits_tco2e'].describe().round(2))

# Save the generated dataset for reference
df.to_csv('data/india_training_dataset.csv', index=False)
print("\n💾 Saved generated dataset to 'data/india_training_dataset.csv'")

# ---------------------------------------------------------------------------
# Model Training
# ---------------------------------------------------------------------------
print("\n⚙️ Building ML training pipeline...")

features = ['land_size_hectares', 'activity_type', 'climate_zone', 'state']
target = 'estimated_carbon_credits_tco2e'

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'),
         ['activity_type', 'climate_zone', 'state'])
    ],
    remainder='passthrough'  # land_size_hectares passes through as-is
)

model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    ))
])

print("🏋️ Training the Random Forest model...")
model_pipeline.fit(X_train, y_train)

train_score = model_pipeline.score(X_train, y_train)
test_score = model_pipeline.score(X_test, y_test)

print(f"\n📊 Model Performance:")
print(f"   Train R² : {train_score:.4f}")
print(f"   Test  R² : {test_score:.4f}")

# Save the trained model artifact
joblib.dump(model_pipeline, 'models/c0_estimator.pkl')
print(f"\n💾 Saved trained model to 'models/c0_estimator.pkl'")

# ---------------------------------------------------------------------------
# Quick sanity check — predict for a sample input
# ---------------------------------------------------------------------------
print("\n🔍 Sanity check predictions:")
test_cases = [
    {'land_size_hectares': 100, 'activity_type': 'Afforestation', 'climate_zone': 'Tropical Wet', 'state': 'Kerala'},
    {'land_size_hectares': 50,  'activity_type': 'Reforestation', 'climate_zone': 'Subtropical', 'state': 'Uttarakhand'},
    {'land_size_hectares': 200, 'activity_type': 'Regenerative Agriculture', 'climate_zone': 'Humid Subtropical', 'state': 'Punjab'},
    {'land_size_hectares': 150, 'activity_type': 'Afforestation', 'climate_zone': 'Arid', 'state': 'Rajasthan'},
]

test_df = pd.DataFrame(test_cases)
predictions = model_pipeline.predict(test_df)

for i, case in enumerate(test_cases):
    print(f"   {case['state']:20s} | {case['activity_type']:28s} | {case['land_size_hectares']:>5} ha → {predictions[i]:>10.2f} tCO2e")

print("\n✅ All done! The model artifact is ready at 'models/c0_estimator.pkl'")
