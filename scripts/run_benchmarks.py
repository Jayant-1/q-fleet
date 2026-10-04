"""
Comprehensive CLI Benchmark Runner.
Executes matched-budget benchmarks for both:
1. Fuel Consumption Prediction (Classical Ridge, RF, GA vs QIEA-GBM)
2. Multi-Objective Fleet Optimization (MO-QIEA vs NSGA-II vs MO-PSO)
Saves results to docs/benchmark_results.json.
"""

import json
import os
import sys

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.prediction.evaluation import run_full_prediction_benchmark, run_mrv_empirical_benchmark
from backend.app.optimization.benchmarks import run_fleet_optimization_benchmark


def main():
    print("=" * 80)
    print("SMART INDIA HACKATHON 2024 (SIH26138) BENCHMARK SUITE")
    print("Quantum-Inspired Fuel Consumption Prediction and Green Fleet Optimization")
    print("=" * 80)

    # 1. Hydrodynamic Prediction Benchmark
    print("\n[PHASE 1/3] RUNNING HYDRODYNAMIC VOYAGE PREDICTION BENCHMARK...")
    pred_res = run_full_prediction_benchmark(n_samples=2000, seed=42)

    print("\nHYDRODYNAMIC PREDICTION RESULTS MATRIX:")
    print(f"{'Model Name':<46} | {'R2 Score':<8} | {'MAE (MT/d)':<10} | {'RMSE':<8} | {'Features':<8} | {'Latency':<8}")
    print("-" * 102)
    for r in pred_res["benchmark_results"]:
        name = r["model_name"]
        r2 = f"{r['r2_score']:.4f}"
        mae = f"{r['mae_mt_day']:.2f}"
        rmse = f"{r['rmse_mt_day']:.2f}"
        f_cnt = f"{r['features_used_count']}/12"
        lat = f"{r['inference_latency_per_sample_ms']:.3f} ms"
        print(f"{name:<46} | {r2:<8} | {mae:<10} | {rmse:<8} | {f_cnt:<8} | {lat:<8}")

    # 2. Real-World MRV Empirical Benchmark
    print("\n[PHASE 2/3] RUNNING EMSA THETIS-MRV EMPIRICAL BENCHMARK (TEMPORAL HOLDOUT)...")
    mrv_res = run_mrv_empirical_benchmark(max_samples=2500, seed=42)

    print(f"\nREAL MRV RESULTS MATRIX ({mrv_res['split_strategy']}):")
    print(f"{'Model Name':<56} | {'R2 Score':<8} | {'MAE (MT)':<10} | {'Features':<8} | {'Latency':<8}")
    print("-" * 102)
    for r in mrv_res["results"]:
        name = r["model_name"]
        r2 = f"{r['r2_score']:.4f}"
        mae = f"{r['mae_annual_mt']:.1f}"
        f_cnt = f"{r['features_used_count']}/8"
        lat = f"{r['inference_latency_per_sample_ms']:.3f} ms"
        print(f"{name:<56} | {r2:<8} | {mae:<10} | {f_cnt:<8} | {lat:<8}")

    # 3. Multi-Objective Fleet Optimization Benchmark
    print("\n[PHASE 3/3] RUNNING MULTI-OBJECTIVE OPTIMIZATION BENCHMARK (BUDGET PARITY)...")
    opt_res = run_fleet_optimization_benchmark(pop_size=35, generations=30, carbon_tax=100.0, seed=42)

    print("\nOPTIMIZATION RESULTS MATRIX (1,050 Evaluations Per Algorithm):")
    print(f"{'Algorithm':<22} | {'Front':<6} | {'Feasible':<9} | {'Hypervolume':<12} | {'Spread (Δ)':<11} | {'Min Fuel':<12} | {'Min WTW GHG':<14} | {'Runtime':<8}")
    print("-" * 106)
    for a in opt_res["algorithms_compared"]:
        name = a["algorithm"]
        sz = str(a["pareto_front_size"])
        feas = f"{a['feasibility_rate_pct']:.1f}%"
        hv = f"{a['hypervolume']:.4f}"
        sp = f"{a['spacing_spread']:.4f}"
        f = f"{a['min_fuel_mt']:,.1f} MT"
        g = f"{a['min_lifecycle_ghg_tco2e']:,.1f} t"
        t = f"{a['execution_time_seconds']:.2f}s"
        print(f"{name:<22} | {sz:<6} | {feas:<9} | {hv:<12} | {sp:<11} | {f:<12} | {g:<14} | {t:<8}")

    print(f"\nWinning Algorithm by Hypervolume: {opt_res['winner_hypervolume']}")
    print(f"Winning Algorithm by Green GHG Abatement: {opt_res['winner_solution_quality']}")

    # Save to docs/benchmark_results.json
    out_path = os.path.join(os.path.dirname(__file__), "..", "docs", "benchmark_results.json")
    with open(out_path, "w") as f:
        json.dump({
            "voyage_prediction_benchmark": pred_res,
            "mrv_empirical_benchmark": mrv_res,
            "fleet_optimization_benchmark": opt_res
        }, f, indent=2)

    print(f"\nBenchmark results successfully persisted to: {out_path}")
    print("=" * 80)


if __name__ == "__main__":
    main()
