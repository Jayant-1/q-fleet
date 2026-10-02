"""
Classical Baseline Predictive Models for Maritime Fuel Consumption.
Provides standard benchmarks: Ridge Regression, Full-Feature Random Forest, and Classical GA-GBM.
"""

import time
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from backend.app.prediction.dataset import FEATURE_NAMES


class ClassicalRidgeBaseline:
    """Baseline 1: L2 Regularized Linear Regression."""
    def __init__(self, alpha: float = 1.0):
        self.scaler = StandardScaler()
        self.model = Ridge(alpha=alpha)
        self.training_time_seconds = 0.0

    def fit(self, X_train: np.ndarray, y_train: np.ndarray):
        t0 = time.perf_counter()
        X_scaled = self.scaler.fit_transform(X_train)
        self.model.fit(X_scaled, y_train)
        self.training_time_seconds = time.perf_counter() - t0

    def predict(self, X: np.ndarray) -> np.ndarray:
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)


class ClassicalRandomForestBaseline:
    """Baseline 2: Standard Random Forest with all 12 operational features."""
    def __init__(self, n_estimators: int = 100, max_depth: int = 8, seed: int = 42):
        self.scaler = StandardScaler()
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=seed,
            n_jobs=-1
        )
        self.training_time_seconds = 0.0

    def fit(self, X_train: np.ndarray, y_train: np.ndarray):
        t0 = time.perf_counter()
        X_scaled = self.scaler.fit_transform(X_train)
        self.model.fit(X_scaled, y_train)
        self.training_time_seconds = time.perf_counter() - t0

    def predict(self, X: np.ndarray) -> np.ndarray:
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)


class ClassicalGAFeatureSelector:
    """
    Baseline 3: Classical Genetic Algorithm for Feature Selection (GA-FS).
    Uses binary string chromosomes, roulette-wheel selection, single-point crossover,
    and standard bit-flip mutation (without quantum superposition or rotation gates).
    """
    def __init__(
        self,
        n_features: int,
        pop_size: int = 20,
        max_generations: int = 25,
        crossover_rate: float = 0.8,
        mutation_rate: float = 0.08,
        seed: int = 42
    ):
        self.n_features = n_features
        self.pop_size = pop_size
        self.max_generations = max_generations
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate
        self.rng = np.random.RandomState(seed)
        self.best_mask: Optional[np.ndarray] = None
        self.best_fitness: float = -float("inf")

    def fit(self, X_train: np.ndarray, y_train: np.ndarray, X_val: np.ndarray, y_val: np.ndarray) -> np.ndarray:
        evaluator = Ridge(alpha=1.0)
        scaler = StandardScaler()
        X_tr = scaler.fit_transform(X_train)
        X_v = scaler.transform(X_val)

        # Initialize classical binary population
        pop = self.rng.choice([0, 1], size=(self.pop_size, self.n_features))
        for ind in pop:
            if np.sum(ind) == 0:
                ind[self.rng.choice(self.n_features, 2, replace=False)] = 1

        for gen in range(self.max_generations):
            fitnesses = np.zeros(self.pop_size)
            for i, ind in enumerate(pop):
                cols = np.where(ind == 1)[0]
                if len(cols) == 0:
                    fitnesses[i] = -1.0
                    continue
                evaluator.fit(X_tr[:, cols], y_train)
                preds = evaluator.predict(X_v[:, cols])
                ss_res = np.sum((y_val - preds) ** 2)
                ss_tot = np.sum((y_val - np.mean(y_val)) ** 2)
                r2 = 1.0 - (ss_res / max(1e-6, ss_tot))
                fitness = r2 - 0.02 * (len(cols) / self.n_features)
                fitnesses[i] = fitness

                if fitness > self.best_fitness:
                    self.best_fitness = fitness
                    self.best_mask = ind.copy()

            # Selection, Crossover, Mutation
            shift_fit = fitnesses - np.min(fitnesses) + 1e-4
            probs = shift_fit / np.sum(shift_fit)
            new_pop = []
            for _ in range(self.pop_size // 2):
                p1_idx = self.rng.choice(self.pop_size, p=probs)
                p2_idx = self.rng.choice(self.pop_size, p=probs)
                c1 = pop[p1_idx].copy()
                c2 = pop[p2_idx].copy()

                if self.rng.rand() < self.crossover_rate:
                    pt = self.rng.randint(1, self.n_features)
                    c1[pt:], c2[pt:] = c2[pt:], c1[pt:]

                # Mutation
                for chrom in [c1, c2]:
                    for bit in range(self.n_features):
                        if self.rng.rand() < self.mutation_rate:
                            chrom[bit] = 1 - chrom[bit]
                    if np.sum(chrom) == 0:
                        chrom[self.rng.choice(self.n_features)] = 1

                new_pop.extend([c1, c2])
            pop = np.array(new_pop)

        return self.best_mask if self.best_mask is not None else np.ones(self.n_features, dtype=int)


class ClassicalGAGBMRegressor:
    """Classical GA-selected Gradient Boosted Regressor."""
    def __init__(self, seed: int = 42):
        self.seed = seed
        self.scaler = StandardScaler()
        self.selector = ClassicalGAFeatureSelector(n_features=len(FEATURE_NAMES), seed=seed)
        self.optimal_mask: Optional[np.ndarray] = None
        self.regressor = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=seed)
        self.training_time_seconds = 0.0

    def fit(self, X_train: np.ndarray, y_train: np.ndarray, X_val: np.ndarray, y_val: np.ndarray):
        t0 = time.perf_counter()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)

        self.optimal_mask = self.selector.fit(X_train, y_train, X_val, y_val)
        active_cols = np.where(self.optimal_mask == 1)[0]
        self.regressor.fit(X_train_scaled[:, active_cols], y_train)
        self.training_time_seconds = time.perf_counter() - t0

    def predict(self, X: np.ndarray) -> np.ndarray:
        X_scaled = self.scaler.transform(X)
        active_cols = np.where(self.optimal_mask == 1)[0]
        return self.regressor.predict(X_scaled[:, active_cols])
