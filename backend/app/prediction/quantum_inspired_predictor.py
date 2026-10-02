"""
Quantum-Inspired Fuel Consumption Prediction Pipeline.
Implements Quantum-Inspired Evolutionary Feature Selection (QIEA-FS) with Q-bit registers,
superposition collapse, quantum rotation gate updates, and Gradient Boosted Regression.
Label: [QUANTUM-INSPIRED METAHEURISTIC COMPONENT].
"""

import math
import time
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from backend.app.prediction.dataset import FEATURE_NAMES, compute_hydrodynamic_fuel
from backend.app.domain.fuels import FuelType, FUEL_REGISTRY
from backend.app.domain.models import VesselType


class QuantumFeatureSelector:
    """
    Quantum-Inspired Evolutionary Algorithm for Feature Selection (QIEA-FS).
    Emulates quantum superposition states and unitary rotation gate dynamics
    to find the optimal, minimal subset of predictive operational features.
    """
    def __init__(
        self,
        n_features: int,
        pop_size: int = 20,
        max_generations: int = 25,
        base_rotation_angle: float = 0.05 * math.pi,
        complexity_penalty: float = 0.02,
        seed: int = 42
    ):
        self.n_features = n_features
        self.pop_size = pop_size
        self.max_generations = max_generations
        self.base_rotation_angle = base_rotation_angle
        self.complexity_penalty = complexity_penalty
        self.seed = seed
        self.rng = np.random.RandomState(seed)

        # Initialize Q-bit population: P individuals, each has n_features Q-bits
        # In equal superposition: alpha = beta = 1 / sqrt(2)
        # alpha^2 = prob(0), beta^2 = prob(1)
        self.q_pop = np.full((pop_size, n_features, 2), 1.0 / math.sqrt(2.0), dtype=np.float64)
        self.best_global_mask: Optional[np.ndarray] = None
        self.best_global_fitness: float = -float("inf")
        self.convergence_curve: List[float] = []

    def _observe_superposition(self, ind_idx: int) -> np.ndarray:
        """Collapses Q-bits to classical binary states based on |beta|^2 probability."""
        betas = self.q_pop[ind_idx, :, 1]
        probs = betas ** 2
        r = self.rng.uniform(0.0, 1.0, size=self.n_features)
        mask = (r < probs).astype(int)

        # Guard: At least 2 features must be active
        if np.sum(mask) < 2:
            top_indices = np.argsort(probs)[-2:]
            mask[top_indices] = 1
        return mask

    def _quantum_rotation_gate(self, ind_idx: int, x: np.ndarray, b: np.ndarray, fitness_improved: bool):
        """
        Applies 2D Givens rotation gate to Q-bit amplitudes:
        [alpha', beta']^T = R(delta_theta) * [alpha, beta]^T
        """
        for i in range(self.n_features):
            xi = x[i]
            bi = b[i]
            delta_theta = 0.0

            if not fitness_improved:
                # Rotate toward best state bi
                if xi == 0 and bi == 1:
                    delta_theta = self.base_rotation_angle
                elif xi == 1 and bi == 0:
                    delta_theta = -self.base_rotation_angle

            # Direction of rotation based on quadrant
            alpha = self.q_pop[ind_idx, i, 0]
            beta = self.q_pop[ind_idx, i, 1]

            if alpha * beta < 0:
                delta_theta = -delta_theta

            cos_t = math.cos(delta_theta)
            sin_t = math.sin(delta_theta)

            new_alpha = cos_t * alpha - sin_t * beta
            new_beta = sin_t * alpha + cos_t * beta

            # Normalize to satisfy |alpha|^2 + |beta|^2 = 1
            norm = math.sqrt(new_alpha ** 2 + new_beta ** 2)
            self.q_pop[ind_idx, i, 0] = new_alpha / norm
            self.q_pop[ind_idx, i, 1] = new_beta / norm

    def fit(self, X_train: np.ndarray, y_train: np.ndarray, X_val: np.ndarray, y_val: np.ndarray) -> np.ndarray:
        """
        Runs the QIEA-FS optimization loop across generations.
        """
        from sklearn.linear_model import Ridge

        # Fast evaluator for feature selection search
        evaluator = Ridge(alpha=1.0)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)

        for gen in range(self.max_generations):
            gen_best_fitness = -float("inf")
            gen_best_mask = None

            for ind in range(self.pop_size):
                mask = self._observe_superposition(ind)
                active_cols = np.where(mask == 1)[0]

                evaluator.fit(X_train_scaled[:, active_cols], y_train)
                y_pred = evaluator.predict(X_val_scaled[:, active_cols])

                # Objective: Maximize R2 on validation, penalize excessive feature count
                ss_res = np.sum((y_val - y_pred) ** 2)
                ss_tot = np.sum((y_val - np.mean(y_val)) ** 2)
                r2 = 1.0 - (ss_res / max(1e-6, ss_tot))
                fitness = r2 - self.complexity_penalty * (len(active_cols) / self.n_features)

                if fitness > gen_best_fitness:
                    gen_best_fitness = fitness
                    gen_best_mask = mask.copy()

                if fitness > self.best_global_fitness:
                    self.best_global_fitness = fitness
                    self.best_global_mask = mask.copy()

                # Apply rotation gate
                target_best = self.best_global_mask if self.best_global_mask is not None else mask
                self._quantum_rotation_gate(ind, mask, target_best, fitness_improved=(fitness >= self.best_global_fitness))

            # Catastrophe mutation if Q-bits are converging prematurely
            diversity = np.mean(np.abs(self.q_pop[:, :, 1] ** 2 - 0.5))
            if diversity > 0.45 and gen < self.max_generations - 5:
                # Reset 30% of non-elite individuals to equal superposition
                reset_indices = self.rng.choice(self.pop_size, size=int(0.3 * self.pop_size), replace=False)
                self.q_pop[reset_indices, :, :] = 1.0 / math.sqrt(2.0)

            self.convergence_curve.append(float(self.best_global_fitness))

        return self.best_global_mask if self.best_global_mask is not None else np.ones(self.n_features, dtype=int)


class QuantumInspiredFuelPredictor:
    """
    Complete Quantum-Inspired Predictive Model Pipeline.
    Combines QIEA-FS feature selection with a tuned Gradient Boosted Regressor.
    """
    def __init__(self, seed: int = 42):
        self.seed = seed
        self.scaler = StandardScaler()
        self.feature_selector: Optional[QuantumFeatureSelector] = None
        self.optimal_feature_mask: Optional[np.ndarray] = None
        self.regressor = GradientBoostingRegressor(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=4,
            random_state=seed
        )
        self.is_fitted: bool = False
        self.training_time_seconds: float = 0.0

    def fit(self, X_train: np.ndarray, y_train: np.ndarray, X_val: np.ndarray, y_val: np.ndarray):
        """Trains the QIEA feature selector followed by the final Gradient Boosted model."""
        start_time = time.perf_counter()

        # 1. Standardize features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)

        # 2. Run Quantum-Inspired Evolutionary Feature Selection
        self.feature_selector = QuantumFeatureSelector(
            n_features=X_train.shape[1],
            pop_size=20,
            max_generations=25,
            seed=self.seed
        )
        self.optimal_feature_mask = self.feature_selector.fit(X_train, y_train, X_val, y_val)

        # 3. Fit final Gradient Boosted Regressor on selected subset
        active_indices = np.where(self.optimal_feature_mask == 1)[0]
        self.regressor.fit(X_train_scaled[:, active_indices], y_train)

        self.training_time_seconds = time.perf_counter() - start_time
        self.is_fitted = True

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predicts daily fuel consumption in MT/day."""
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted before predict.")
        X_scaled = self.scaler.transform(X)
        active_indices = np.where(self.optimal_feature_mask == 1)[0]
        return self.regressor.predict(X_scaled[:, active_indices])

    def predict_single_voyage(
        self,
        vessel_type: VesselType,
        dwt: float,
        speed_knots: float,
        cargo_load_ratio: float,
        draft_meters: float,
        wind_speed_knots: float,
        wave_height_meters: float,
        current_knots: float,
        fuel_type: FuelType = FuelType.VLSFO,
        use_quantum: bool = True
    ) -> Dict[str, Any]:
        """
        Executes single voyage operational prediction with latency tracking
        and alternative fuel LHV conversion.
        """
        t0 = time.perf_counter()
        from backend.app.prediction.dataset import VESSEL_TYPE_MAP

        # 1. Physics hydrodynamic ground truth for breakdown
        hydro = compute_hydrodynamic_fuel(
            vessel_type=vessel_type,
            dwt=dwt,
            speed_knots=speed_knots,
            cargo_load_ratio=cargo_load_ratio,
            draft_meters=draft_meters,
            wind_speed_knots=wind_speed_knots,
            wave_height_meters=wave_height_meters,
            current_knots=current_knots,
            noise_std=0.0
        )

        v_type_idx = float(VESSEL_TYPE_MAP[vessel_type])
        sample_x = np.array([[
            speed_knots,
            dwt,
            cargo_load_ratio,
            draft_meters,
            wind_speed_knots,
            wave_height_meters,
            current_knots,
            v_type_idx,
            1.05,   # average fouling
            15.0,   # sea temp C
            180.0,  # water depth
            hydro["engine_mcr_ratio"]
        ]], dtype=np.float64)

        if self.is_fitted and use_quantum and self.optimal_feature_mask is not None:
            raw_fuel_vlsfo_mt = float(self.predict(sample_x)[0])
        else:
            raw_fuel_vlsfo_mt = float(hydro["daily_fuel_mt"])

        # Fuel LHV conversion
        # Equal energy delivery: M_alt = M_vlsfo * (LHV_vlsfo / LHV_alt)
        spec = FUEL_REGISTRY[fuel_type]
        vlsfo_lhv = FUEL_REGISTRY[FuelType.VLSFO].lhv_mj_per_kg
        adjusted_fuel_mt = raw_fuel_vlsfo_mt * (vlsfo_lhv / spec.lhv_mj_per_kg)

        latency_ms = (time.perf_counter() - t0) * 1000.0

        mask_list = self.optimal_feature_mask.tolist() if self.optimal_feature_mask is not None else [1] * len(FEATURE_NAMES)
        active_names = [name for name, m in zip(FEATURE_NAMES, mask_list) if m == 1]

        return {
            "predicted_fuel_mt_per_day": round(raw_fuel_vlsfo_mt, 2),
            "specific_fuel_oil_consumption_g_per_kwh": round(hydro["sfoc_g_per_kwh"], 2),
            "estimated_shaft_power_kw": round(hydro["shaft_power_kw"], 1),
            "calm_water_power_kw": round(hydro["calm_water_power_kw"], 1),
            "added_weather_resistance_kw": round(hydro["added_weather_resistance_kw"], 1),
            "fuel_type": fuel_type,
            "lhv_adjusted_daily_mt": round(adjusted_fuel_mt, 2),
            "feature_importance_mask": mask_list,
            "feature_names_used": active_names,
            "model_version": "qiea-gbm-v1.0",
            "inference_latency_ms": round(latency_ms, 2)
        }
