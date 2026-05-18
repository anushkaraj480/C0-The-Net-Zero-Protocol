import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

print("🚀 Loading datasets...")
# Load the downloaded dataset
df = pd.read_csv('data/land_use_emissions.csv')

# --- Dummy Data Preparation Script for Template Execution ---
# (In case your friend wants to test the pipeline immediately before fine-tuning)
if 'land_size' not in df.columns:
    print("📝 Synthesizing operational training rows for the template feature pipeline...")
    np.random.seed(42)
    n_samples = 2000
    df = pd.DataFrame({
        'land_size': np.random.uniform(10, 1000, n_samples),
        'activity_type': np.random.choice(['Afforestation', 'Solar Installation', 'Regenerative Agriculture'], n_samples),
        'climate_zone': np.random.choice(['Tropical', 'Temperate', 'Arid'], n_samples)
    })
    # Apply baseline math for target generation
    multipliers = {'Afforestation': 8.0, 'Solar Installation': 150.0, 'Regenerative Agriculture': 2.5}
    climate_mult = {'Tropical': 1.2, 'Temperate': 1.0, 'Arid': 0.6}
    
    df['carbon_credits'] = df.apply(lambda row: row['land_size'] * multipliers[row['activity_type']] * climate_mult[row['climate_zone']] + np.random.normal(0, 10), axis=1)

# Features and Target split
X = df[['land_size', 'activity_type', 'climate_zone']]
y = df['carbon_credits']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("⚙️ Building training pipeline with OneHotEncoding...")
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(drop='first'), ['activity_type', 'climate_zone'])
    ], remainder='passthrough'
)

# Bundle preprocessing and the Random Forest estimator together
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

print("🏋️ Training the ML Model...")
model_pipeline.fit(X_train, y_train)

score = model_pipeline.score(X_test, y_test)
print(f"✅ Training complete! Model R² Score: {score:.4f}")

# Save the trained model artifact to the models/ folder
joblib.dump(model_pipeline, 'models/c0_estimator.pkl')
print("💾 Saved trained artifact to 'models/c0_estimator.pkl'")
