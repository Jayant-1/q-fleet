# Benchmarking Methodology and Experimental Design
## Rigorous Comparison of Quantum-Inspired vs Classical Algorithms

### 1. Prediction Model Benchmarks
To evaluate the Quantum-Inspired Evolutionary Feature Selection & Hyperparameter Optimization (QIEA-FS) against classical methods:
1. **Dataset**: 10,000 synthetic operational vessel voyages generated using physics-based naval architecture formulations (Holtrop-Mennen power-speed cubic scaling, Beaufort wave added resistance, engine SFOC curves).
2. **Train / Validation / Test Splits**: Strict 70% Train, 15% Validation, 15% Holdout Test partition. Zero data leakage across splits.
3. **Candidate Models**:
   - Baseline 1: Ordinary Least Squares (OLS) Linear Regression.
   - Baseline 2: Ridge Regression (L2 regularized).
   - Baseline 3: Standard Random Forest Regressor (all 12 operational features).
   - Baseline 4: Classical Genetic Algorithm with Gradient Boosted Regressor (GA-GBM).
   - Proposed: Quantum-Inspired Evolutionary Algorithm Feature Selection with Gradient Boosted Regressor (QIEA-GBM).
4. **Metrics**:
   - Mean Absolute Error: $\text{MAE} = \frac{1}{N} \sum |y_i - \hat{y}_i|$ (MT/day)
   - Root Mean Squared Error: $\text{RMSE} = \sqrt{\frac{1}{N} \sum (y_i - \hat{y}_i)^2}$ (MT/day)
   - Mean Absolute Percentage Error: $\text{MAPE} = \frac{1}{N} \sum |\frac{y_i - \hat{y}_i}{y_i}| \times 100\%$
   - Coefficient of Determination: $R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$
   - Inference Latency (milliseconds per sample).

---

### 2. Multi-Objective Optimization Benchmarks
To evaluate the Multi-Objective Quantum-Inspired Evolutionary Algorithm (MO-QIEA) for green fleet deployment:
1. **Scenario Configuration**: 5 global shipping corridors, 15 commercial vessel candidates across 5 vessel classes, 6 fuel options + shore power.
2. **Budget Parity**: Identical computational budget of 2,000 function evaluations across all optimizers (Population $N=40$, Generations $G=50$).
3. **Algorithms Compared**:
   - Proposed: Multi-Objective Quantum-Inspired Evolutionary Algorithm (MO-QIEA) with multi-state Q-bits and rotation gates.
   - Baseline 1: Non-dominated Sorting Genetic Algorithm II (NSGA-II) with SBX crossover and polynomial mutation.
   - Baseline 2: Multi-Objective Particle Swarm Optimization (MO-PSO) with inertia weight and external archive.
4. **Pareto Quality Metrics**:
   - **Hypervolume (HV)**: Volume of the objective space dominated by the Pareto front relative to reference point $\mathbf{r} = (f_1^{\max}, f_2^{\max}, f_3^{\max})$. Higher is superior.
   - **Spacing / Spread ($\Delta$)**: Measure of uniform distribution and extent of non-dominated solutions across the front. Lower is more uniform.
   - **Generational Distance (GD)**: Average Euclidean distance from obtained front to empirical reference front.
   - **Feasibility Rate (%)**: Percentage of returned solutions satisfying 100% of demand, schedule, and vessel constraints without penalty.
   - **Execution Wall-Clock Time (s)**.
