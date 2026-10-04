"""
Statistical Evaluation and Model Benchmarking for Fuel Consumption Prediction.
Computes MAE, RMSE, MAPE, R2, and Inference Latency across classical and quantum-inspired models.
"""

import time
import numpy as np
from typing import Dict, Any, List, Optional
from backend.app.prediction.dataset import (
    generate_synthetic_voyage_dataset,
    get_train_val_test_splits,
    FEATURE_NAMES
)
from backend.app.prediction.quantum_inspired_predictor import QuantumInspiredFuelPredictor
from backend.app.prediction.classical_models import (
    ClassicalRidgeBaseline,
    ClassicalRandomForestBaseline,
    ClassicalGAGBMRegressor
)


def calculate_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Computes standard, non-misleading regression metrics."""
    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))

    # Safe MAPE with guard against tiny denominators
    safe_y_true = np.where(y_true < 1.0, 1.0, y_true)
    mape = float(np.mean(np.abs((y_true - y_pred) / safe_y_true)) * 100.0)

    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    r2 = float(1.0 - (ss_res / max(1e-6, ss_tot)))

    return {
        "mae_mt_day": round(mae, 3),
        "rmse_mt_day": round(rmse, 3),
        "mape_pct": round(mape, 2),
        "r2_score": round(r2, 4)
    }


def run_full_prediction_benchmark(
    n_samples: int = 4000,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Executes an honest, multi-model benchmark on identical train/val/test splits.
    Returns comparison matrix between Classical Ridge, Classical RF, Classical GA-GBM, and Proposed QIEA-GBM.
    """
    X, y, feature_names = generate_synthetic_voyage_dataset(n_samples=n_samples, seed=seed)
    splits = get_train_val_test_splits(X, y, train_ratio=0.70, val_ratio=0.15, seed=seed)

    X_train, y_train = splits["X_train"], splits["y_train"]
    X_val, y_val = splits["X_val"], splits["y_val"]
    X_test, y_test = splits["X_test"], splits["y_test"]

    models = {
        "Classical Ridge Regression": ClassicalRidgeBaseline(),
        "Classical Random Forest (Full 12 Features)": ClassicalRandomForestBaseline(seed=seed),
        "Classical GA-GBM (Binary GA Feature Selection)": ClassicalGAGBMRegressor(seed=seed),
        "Quantum-Inspired QIEA-GBM (Proposed)": QuantumInspiredFuelPredictor(seed=seed)
    }

    benchmark_results: List[Dict[str, Any]] = []

    for name, model in models.items():
        # Train
        t_train_start = time.perf_counter()
        if "GBM" in name or "Quantum" in name:
            model.fit(X_train, y_train, X_val, y_val)
        else:
            model.fit(X_train, y_train)
        train_time = time.perf_counter() - t_train_start

        # Inference on Test Split
        t_infer_start = time.perf_counter()
        y_test_pred = model.predict(X_test)
        infer_time = time.perf_counter() - t_infer_start
        latency_per_sample_ms = (infer_time / len(X_test)) * 1000.0

        metrics = calculate_regression_metrics(y_test, y_test_pred)

        # Feature count and active features
        features_used = len(feature_names)
        active_features = feature_names
        if hasattr(model, "optimal_feature_mask") and model.optimal_feature_mask is not None:
            features_used = int(np.sum(model.optimal_feature_mask))
            active_features = [f for f, m in zip(feature_names, model.optimal_feature_mask) if m == 1]
        elif hasattr(model, "optimal_mask") and model.optimal_mask is not None:
            features_used = int(np.sum(model.optimal_mask))
            active_features = [f for f, m in zip(feature_names, model.optimal_mask) if m == 1]

        benchmark_results.append({
            "model_name": name,
            "r2_score": metrics["r2_score"],
            "mae_mt_day": metrics["mae_mt_day"],
            "rmse_mt_day": metrics["rmse_mt_day"],
            "mape_pct": metrics["mape_pct"],
            "features_used_count": features_used,
            "features_used_names": active_features,
            "training_time_seconds": round(train_time, 2),
            "inference_latency_per_sample_ms": round(latency_per_sample_ms, 3)
        })

    return {
        "dataset_samples": n_samples,
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "benchmark_results": benchmark_results,
        "provenance": "[SYNTHETIC-SIMULATED: Hydrodynamic Holtrop-Mennen Dataset]"
    }


def run_mrv_empirical_benchmark(
    max_samples: Optional[int] = 5000,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Executes benchmark on real EMSA THETIS-MRV measured dataset.
    Uses strict temporal holdout (Train=2022, Test=2023) and zero target leakage.
    Compares:
      1. Classical Ridge Regression
      2. Classical Random Forest
      3. Classical GA-GBM (Genetic Algorithm Feature Selection)
      4. Proposed Quantum-Inspired QIEA-GBM (Rotation Gate Superposition Search)
    """
    from backend.app.prediction.dataset import load_mrv_vessel_dataset, get_mrv_temporal_splits, MRV_FEATURE_NAMES
    from sklearn.linear_model import Ridge
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import StandardScaler

    df, X, y, feat_names, prep = load_mrv_vessel_dataset(max_samples=max_samples)
    splits = get_mrv_temporal_splits(df, prep)

    X_train, y_train = splits["X_train"], splits["y_train"]
    X_val, y_val = splits["X_val"], splits["y_val"]
    X_test, y_test = splits["X_test"], splits["y_test"]

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_val_s = scaler.transform(X_val)
    X_test_s = scaler.transform(X_test)

    # 1. Classical Ridge
    t0 = time.perf_counter()
    ridge = Ridge(alpha=1.0)
    ridge.fit(X_train_s, y_train)
    ridge_time = time.perf_counter() - t0
    t_inf = time.perf_counter()
    y_pred_ridge = ridge.predict(X_test_s)
    ridge_lat = ((time.perf_counter() - t_inf) / len(X_test)) * 1000.0
    ridge_metrics = calculate_regression_metrics(y_test, y_pred_ridge)

    # 2. Classical Random Forest
    t0 = time.perf_counter()
    rf = RandomForestRegressor(n_estimators=80, max_depth=10, random_state=seed, n_jobs=-1)
    rf.fit(X_train_s, y_train)
    rf_time = time.perf_counter() - t0
    t_inf = time.perf_counter()
    y_pred_rf = rf.predict(X_test_s)
    rf_lat = ((time.perf_counter() - t_inf) / len(X_test)) * 1000.0
    rf_metrics = calculate_regression_metrics(y_test, y_pred_rf)

    # 3. Classical GA-GBM
    t0 = time.perf_counter()
    from backend.app.prediction.classical_models import ClassicalGAGBMRegressor
    ga_model = ClassicalGAGBMRegressor(seed=seed)
    ga_model.fit(X_train, y_train, X_val, y_val)
    ga_time = time.perf_counter() - t0
    t_inf = time.perf_counter()
    y_pred_ga = ga_model.predict(X_test)
    ga_lat = ((time.perf_counter() - t_inf) / len(X_test)) * 1000.0
    ga_metrics = calculate_regression_metrics(y_test, y_pred_ga)

    # 4. Proposed Quantum-Inspired QIEA-GBM
    t0 = time.perf_counter()
    from backend.app.prediction.quantum_inspired_predictor import MRVEmpiricalPredictor
    qiea_model = MRVEmpiricalPredictor(seed=seed)
    qiea_model.fit(X_train, y_train, X_val, y_val, feature_names=feat_names)
    qiea_time = time.perf_counter() - t0
    t_inf = time.perf_counter()
    y_pred_qiea = qiea_model.predict(X_test)
    qiea_lat = ((time.perf_counter() - t_inf) / len(X_test)) * 1000.0
    qiea_metrics = calculate_regression_metrics(y_test, y_pred_qiea)

    return {
        "benchmark_dataset": "EMSA THETIS-MRV (Official 2022-2023 EU Reporting)",
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "split_strategy": "Temporal Holdout: Train=2022, Test=2023 (Zero Target Leakage)",
        "results": [
            {
                "model_name": "Classical Ridge Regression (Linear Baseline)",
                "r2_score": ridge_metrics["r2_score"],
                "mae_annual_mt": ridge_metrics["mae_mt_day"],
                "rmse_annual_mt": ridge_metrics["rmse_mt_day"],
                "mape_pct": ridge_metrics["mape_pct"],
                "features_used_count": len(feat_names),
                "training_time_seconds": round(ridge_time, 2),
                "inference_latency_per_sample_ms": round(ridge_lat, 3)
            },
            {
                "model_name": "Classical Random Forest (Non-Linear Baseline)",
                "r2_score": rf_metrics["r2_score"],
                "mae_annual_mt": rf_metrics["mae_mt_day"],
                "rmse_annual_mt": rf_metrics["rmse_mt_day"],
                "mape_pct": rf_metrics["mape_pct"],
                "features_used_count": len(feat_names),
                "training_time_seconds": round(rf_time, 2),
                "inference_latency_per_sample_ms": round(rf_lat, 3)
            },
            {
                "model_name": "Classical GA-GBM (Genetic Algorithm Feature Selection)",
                "r2_score": ga_metrics["r2_score"],
                "mae_annual_mt": ga_metrics["mae_mt_day"],
                "rmse_annual_mt": ga_metrics["rmse_mt_day"],
                "mape_pct": ga_metrics["mape_pct"],
                "features_used_count": int(np.sum(ga_model.optimal_mask)) if ga_model.optimal_mask is not None else len(feat_names),
                "training_time_seconds": round(ga_time, 2),
                "inference_latency_per_sample_ms": round(ga_lat, 3)
            },
            {
                "model_name": "Quantum-Inspired QIEA-GBM (Proposed Rotation Gate Selection)",
                "r2_score": qiea_metrics["r2_score"],
                "mae_annual_mt": qiea_metrics["mae_mt_day"],
                "rmse_annual_mt": qiea_metrics["rmse_mt_day"],
                "mape_pct": qiea_metrics["mape_pct"],
                "features_used_count": int(np.sum(qiea_model.optimal_feature_mask)) if qiea_model.optimal_feature_mask is not None else len(feat_names),
                "training_time_seconds": round(qiea_time, 2),
                "inference_latency_per_sample_ms": round(qiea_lat, 3)
            }
        ]
    }

