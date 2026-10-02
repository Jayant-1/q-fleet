"""
Statistical Evaluation and Model Benchmarking for Fuel Consumption Prediction.
Computes MAE, RMSE, MAPE, R2, and Inference Latency across classical and quantum-inspired models.
"""

import time
import numpy as np
from typing import Dict, Any, List
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
