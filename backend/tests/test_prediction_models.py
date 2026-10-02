"""Unit tests for fuel consumption prediction and quantum feature selection."""

import pytest
import numpy as np
from backend.app.domain.models import VesselType
from backend.app.domain.fuels import FuelType
from backend.app.prediction.dataset import (
    compute_hydrodynamic_fuel,
    generate_synthetic_voyage_dataset,
    get_train_val_test_splits
)
from backend.app.prediction.quantum_inspired_predictor import QuantumInspiredFuelPredictor
from backend.app.prediction.evaluation import calculate_regression_metrics


def test_hydrodynamic_physics_monotonicity():
    """Verifies fuel consumption increases monotonically with speed."""
    v_type = VesselType.CONTAINER_ULTRALARGE
    dwt = 195000
    calc_low = compute_hydrodynamic_fuel(v_type, dwt, speed_knots=14.0, cargo_load_ratio=0.8, draft_meters=15.0, wind_speed_knots=10.0, wave_height_meters=1.5, current_knots=0.0)
    calc_high = compute_hydrodynamic_fuel(v_type, dwt, speed_knots=20.0, cargo_load_ratio=0.8, draft_meters=15.0, wind_speed_knots=10.0, wave_height_meters=1.5, current_knots=0.0)

    assert calc_high["shaft_power_kw"] > calc_low["shaft_power_kw"]
    assert calc_high["daily_fuel_mt"] > calc_low["daily_fuel_mt"]


def test_weather_added_resistance():
    """Verifies added weather resistance increases with wave height and wind."""
    v_type = VesselType.CONTAINER_POSTPANAMAX
    dwt = 95000
    calc_calm = compute_hydrodynamic_fuel(v_type, dwt, speed_knots=17.0, cargo_load_ratio=0.8, draft_meters=13.0, wind_speed_knots=5.0, wave_height_meters=0.5, current_knots=0.0)
    calc_storm = compute_hydrodynamic_fuel(v_type, dwt, speed_knots=17.0, cargo_load_ratio=0.8, draft_meters=13.0, wind_speed_knots=35.0, wave_height_meters=5.0, current_knots=0.0)

    assert calc_storm["added_weather_resistance_kw"] > calc_calm["added_weather_resistance_kw"]
    assert calc_storm["daily_fuel_mt"] > calc_calm["daily_fuel_mt"]


def test_qiea_predictor_training_and_accuracy():
    """Verifies QIEA-GBM achieves R2 >= 0.88 and MAE < 25 MT/day on holdout test partition."""
    X, y, _ = generate_synthetic_voyage_dataset(n_samples=800, seed=42)
    splits = get_train_val_test_splits(X, y, seed=42)

    predictor = QuantumInspiredFuelPredictor(seed=42)
    predictor.fit(splits["X_train"], splits["y_train"], splits["X_val"], splits["y_val"])

    assert predictor.is_fitted
    assert predictor.optimal_feature_mask is not None
    assert np.sum(predictor.optimal_feature_mask) < len(predictor.optimal_feature_mask)  # Achieved sparse reduction

    preds = predictor.predict(splits["X_test"])
    metrics = calculate_regression_metrics(splits["y_test"], preds)

    assert metrics["r2_score"] >= 0.88
    assert metrics["mae_mt_day"] < 25.0


def test_prediction_inference_latency():
    """Verifies single-voyage prediction latency is < 15 ms."""
    predictor = QuantumInspiredFuelPredictor(seed=42)
    X, y, _ = generate_synthetic_voyage_dataset(n_samples=500, seed=42)
    splits = get_train_val_test_splits(X, y, seed=42)
    predictor.fit(splits["X_train"], splits["y_train"], splits["X_val"], splits["y_val"])

    res = predictor.predict_single_voyage(
        vessel_type=VesselType.CONTAINER_ULTRALARGE,
        dwt=195000,
        speed_knots=19.0,
        cargo_load_ratio=0.85,
        draft_meters=15.0,
        wind_speed_knots=12.0,
        wave_height_meters=1.8,
        current_knots=0.2,
        fuel_type=FuelType.LNG
    )

    assert res["inference_latency_ms"] < 15.0
    assert res["predicted_fuel_mt_per_day"] > 0
    assert res["lhv_adjusted_daily_mt"] > 0
