"""
FastAPI Routes for Fuel Consumption Prediction & Quantum Feature Selection.
"""

from fastapi import APIRouter, HTTPException
from pathlib import Path
from backend.app.domain.schemas import (
    PredictFuelRequest,
    PredictFuelResponse,
    PredictMRVAnnualRequest,
    PredictMRVAnnualResponse
)
from backend.app.prediction.quantum_inspired_predictor import (
    QuantumInspiredFuelPredictor,
    MRVEmpiricalPredictor
)
from backend.app.prediction.evaluation import (
    run_full_prediction_benchmark,
    run_mrv_empirical_benchmark
)
from backend.app.prediction.dataset import (
    generate_synthetic_voyage_dataset,
    get_train_val_test_splits,
    load_mrv_vessel_dataset,
    get_mrv_temporal_splits,
    MRV_FEATURE_NAMES
)

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

# Global trained predictor instances
_predictor = QuantumInspiredFuelPredictor(seed=42)
_mrv_predictor: MRVEmpiricalPredictor = None
_is_initialized = False


def _ensure_predictors_ready():
    global _is_initialized, _mrv_predictor
    if not _is_initialized:
        # 1. Voyage Simulator Model
        X, y, _ = generate_synthetic_voyage_dataset(n_samples=1200, seed=42)
        splits = get_train_val_test_splits(X, y, seed=42)
        _predictor.fit(splits["X_train"], splits["y_train"], splits["X_val"], splits["y_val"])

        # 2. Real EMSA MRV Empirical Model
        model_file = Path(__file__).resolve().parent.parent / "prediction" / "models" / "mrv_fuel_predictor.joblib"
        if model_file.exists():
            try:
                _mrv_predictor = MRVEmpiricalPredictor.load(str(model_file))
            except Exception:
                _mrv_predictor = None

        if _mrv_predictor is None or not _mrv_predictor.is_fitted:
            _mrv_predictor = MRVEmpiricalPredictor(seed=42)
            try:
                df, X_mrv, y_mrv, feat_names, prep = load_mrv_vessel_dataset(max_samples=2500)
                mrv_splits = get_mrv_temporal_splits(df, prep)
                _mrv_predictor.fit(
                    mrv_splits["X_train"], mrv_splits["y_train"],
                    mrv_splits["X_val"], mrv_splits["y_val"],
                    feature_names=MRV_FEATURE_NAMES
                )
            except Exception as e:
                print(f"Warning: Failed to train MRV predictor on startup: {e}")

        _is_initialized = True


@router.post("/fuel", response_model=PredictFuelResponse)
def predict_vessel_fuel(req: PredictFuelRequest):
    """
    Predicts single-voyage daily fuel consumption, shaft power, and SFOC
    using first-principles naval hydrodynamics (Holtrop-Mennen + Kwon).
    Label: [MODELED ESTIMATE: Hydrodynamic Holtrop-Mennen Power Scaling + Kwon]
    """
    _ensure_predictors_ready()
    try:
        res = _predictor.predict_single_voyage(
            vessel_type=req.vessel_type,
            dwt=req.dwt,
            speed_knots=req.speed_knots,
            cargo_load_ratio=req.cargo_load_ratio,
            draft_meters=req.draft_meters,
            wind_speed_knots=req.wind_speed_knots,
            wave_height_meters=req.wave_height_meters,
            current_knots=req.current_knots,
            fuel_type=req.fuel_type,
            use_quantum=req.use_quantum_feature_selector
        )
        return PredictFuelResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voyage prediction failed: {str(e)}")


@router.post("/annual-mrv", response_model=PredictMRVAnnualResponse)
def predict_mrv_annual_fuel(req: PredictMRVAnnualRequest):
    """
    Predicts annual vessel fuel consumption trained on real EMSA THETIS-MRV data.
    Enforces strict zero target-leakage and returns 95% confidence intervals.
    Label: [MEASURED-ANNUAL-EMSA-MRV: QIEA-FS Gradient Boosting]
    """
    _ensure_predictors_ready()
    if _mrv_predictor is None or not _mrv_predictor.is_fitted:
        raise HTTPException(status_code=503, detail="MRV Empirical predictor not initialized")

    try:
        res = _mrv_predictor.predict_annual(
            time_at_sea_hours=req.time_at_sea_hours,
            efficiency_val_gco2_per_tnm=req.efficiency_val_gco2_per_tnm,
            ship_type_str=req.ship_type,
            efficiency_type_str=req.efficiency_type,
            has_ice_class=req.has_ice_class,
            time_at_sea_through_ice_hours=req.time_at_sea_through_ice_hours
        )
        return PredictMRVAnnualResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MRV annual prediction failed: {str(e)}")


@router.get("/benchmark")
def get_prediction_benchmark(n_samples: int = 1500, seed: int = 42):
    """
    Returns comparative statistical benchmarks across Ridge, Random Forest, Classical GA, and QIEA-GBM
    on voyage-level hydrodynamics.
    """
    try:
        res = run_full_prediction_benchmark(n_samples=n_samples, seed=seed)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction benchmark failed: {str(e)}")


@router.get("/mrv-benchmark")
def get_mrv_empirical_benchmark(max_samples: int = 2500, seed: int = 42):
    """
    Returns comparative statistical benchmarks on real EMSA THETIS-MRV data (2022-2023 holdout).
    """
    try:
        res = run_mrv_empirical_benchmark(max_samples=max_samples, seed=seed)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MRV empirical benchmark failed: {str(e)}")

