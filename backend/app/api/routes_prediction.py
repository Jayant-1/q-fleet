"""
FastAPI Routes for Fuel Consumption Prediction & Quantum Feature Selection.
"""

from fastapi import APIRouter, HTTPException
from backend.app.domain.schemas import PredictFuelRequest, PredictFuelResponse
from backend.app.prediction.quantum_inspired_predictor import QuantumInspiredFuelPredictor
from backend.app.prediction.evaluation import run_full_prediction_benchmark
from backend.app.prediction.dataset import generate_synthetic_voyage_dataset, get_train_val_test_splits

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

# Global trained predictor instance
_predictor = QuantumInspiredFuelPredictor(seed=42)
_is_initialized = False


def _ensure_predictor_trained():
    global _is_initialized
    if not _is_initialized:
        X, y, _ = generate_synthetic_voyage_dataset(n_samples=1200, seed=42)
        splits = get_train_val_test_splits(X, y, seed=42)
        _predictor.fit(splits["X_train"], splits["y_train"], splits["X_val"], splits["y_val"])
        _is_initialized = True


@router.post("/fuel", response_model=PredictFuelResponse)
def predict_vessel_fuel(req: PredictFuelRequest):
    """
    Predicts single-voyage daily fuel consumption, shaft power, and SFOC
    with quantum-inspired feature selection and alternative fuel conversion.
    """
    _ensure_predictor_trained()
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
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/benchmark")
def get_prediction_benchmark(n_samples: int = 1500, seed: int = 42):
    """
    Returns comparative statistical benchmarks across Ridge, Random Forest, Classical GA, and QIEA-GBM.
    """
    try:
        res = run_full_prediction_benchmark(n_samples=n_samples, seed=seed)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction benchmark failed: {str(e)}")
