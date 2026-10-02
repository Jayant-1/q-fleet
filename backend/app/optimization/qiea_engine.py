"""
Multi-Objective Quantum-Inspired Evolutionary Algorithm (MO-QIEA) for Green Fleet Optimization.
Employs multi-state Q-bit superposition registers, adaptive quantum rotation gates,
dynamic catastrophe mutation, and non-dominated Pareto archiving.
Label: [CORE QUANTUM-INSPIRED METAHEURISTIC ENGINE].
"""

import math
import time
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from backend.app.domain.fuels import FuelType
from backend.app.domain.models import FleetDeploymentSolution
from backend.app.optimization.problem import FleetDeploymentProblem


def fast_non_dominated_sort(objectives: np.ndarray) -> List[List[int]]:
    """
    Standard NSGA-II fast non-dominated sorting algorithm.
    objectives: array of shape (N, M), where lower is better for all M objectives.
    Returns: List of fronts, each front is a list of individual indices.
    """
    n = objectives.shape[0]
    domination_counts = np.zeros(n, dtype=int)
    dominated_sets: List[List[int]] = [[] for _ in range(n)]
    fronts: List[List[int]] = [[]]

    for p in range(n):
        for q in range(p + 1, n):
            # Check if p dominates q
            p_leq_q = np.all(objectives[p] <= objectives[q])
            p_less_q = np.any(objectives[p] < objectives[q])
            q_leq_p = np.all(objectives[q] <= objectives[p])
            q_less_p = np.any(objectives[q] < objectives[p])

            if p_leq_q and p_less_q:
                dominated_sets[p].append(q)
                domination_counts[q] += 1
            elif q_leq_p and q_less_p:
                dominated_sets[q].append(p)
                domination_counts[p] += 1

        if domination_counts[p] == 0:
            fronts[0].append(p)

    current_front_idx = 0
    while len(fronts[current_front_idx]) > 0:
        next_front: List[int] = []
        for p in fronts[current_front_idx]:
            for q in dominated_sets[p]:
                domination_counts[q] -= 1
                if domination_counts[q] == 0:
                    next_front.append(q)
        current_front_idx += 1
        fronts.append(next_front)

    if len(fronts[-1]) == 0:
        fronts.pop()
    return fronts


def calculate_crowding_distance(objectives: np.ndarray, front: List[int]) -> Dict[int, float]:
    """Calculates Manhattan crowding distance for diversity preservation."""
    n_in_front = len(front)
    if n_in_front <= 2:
        return {idx: float("inf") for idx in front}

    distances = {idx: 0.0 for idx in front}
    n_objs = objectives.shape[1]

    for m in range(n_objs):
        sorted_front = sorted(front, key=lambda idx: objectives[idx, m])
        min_val = objectives[sorted_front[0], m]
        max_val = objectives[sorted_front[-1], m]
        diff = max(1e-6, max_val - min_val)

        distances[sorted_front[0]] = float("inf")
        distances[sorted_front[-1]] = float("inf")

        for k in range(1, n_in_front - 1):
            if distances[sorted_front[k]] != float("inf"):
                prev_val = objectives[sorted_front[k - 1], m]
                next_val = objectives[sorted_front[k + 1], m]
                distances[sorted_front[k]] += (next_val - prev_val) / diff

    return distances


def compute_hypervolume_2d(points_2d: np.ndarray, ref_point: Tuple[float, float]) -> float:
    """Computes exact 2D hypervolume dominated by points w.r.t. ref_point."""
    if len(points_2d) == 0:
        return 0.0
    sorted_pts = points_2d[np.argsort(points_2d[:, 0])]
    hv = 0.0
    current_y = ref_point[1]
    for pt in sorted_pts:
        if pt[0] < ref_point[0] and pt[1] < current_y:
            hv += (ref_point[0] - pt[0]) * (current_y - pt[1])
            current_y = pt[1]
    return float(hv)


class MultiObjectiveQIEA:
    """
    Multi-Objective Quantum-Inspired Evolutionary Algorithm (MO-QIEA)
    for optimal maritime green fleet deployment.
    """
    def __init__(
        self,
        problem: FleetDeploymentProblem,
        pop_size: int = 40,
        generations: int = 50,
        rotation_step: float = 0.06 * math.pi,
        catastrophe_threshold: float = 0.04,
        seed: int = 42
    ):
        self.problem = problem
        self.pop_size = pop_size
        self.generations = generations
        self.rotation_step = rotation_step
        self.catastrophe_threshold = catastrophe_threshold
        self.seed = seed
        self.rng = np.random.RandomState(seed)

        self.n_vessels = len(self.problem.fleet)
        self.n_routes = len(self.problem.corridor_list)
        self.fuel_types = list(FuelType)
        self.n_fuels = len(self.fuel_types)

        # Multi-state Quantum Registers for each individual:
        # 1. Route Q-qudits: shape (pop_size, n_vessels, n_routes + 1) [0 = idle, 1..R = routes]
        # 2. Fuel Q-qudits: shape (pop_size, n_vessels, n_fuels)
        # 3. Speed phase angle theta: shape (pop_size, n_vessels) in [0, pi/2]
        # 4. Shore power Q-bit: shape (pop_size, n_vessels, 2)
        self._init_quantum_registers()

        # External Pareto Archive
        self.archive_solutions: List[FleetDeploymentSolution] = []
        self.archive_objectives: List[Tuple[float, float, float]] = []
        self.archive_chromosomes: List[List[Dict[str, Any]]] = []
        self.convergence_history: List[Dict[str, Any]] = []

    def _init_quantum_registers(self):
        """Initializes all Q-bits to equal superposition state."""
        # Equal amplitude 1 / sqrt(n_states)
        self.q_route = np.full(
            (self.pop_size, self.n_vessels, self.n_routes + 1),
            1.0 / math.sqrt(self.n_routes + 1),
            dtype=np.float64
        )
        self.q_fuel = np.full(
            (self.pop_size, self.n_vessels, self.n_fuels),
            1.0 / math.sqrt(self.n_fuels),
            dtype=np.float64
        )
        # Random initial phase angles for continuous speeds
        self.theta_speed = self.rng.uniform(0.1, 0.4 * math.pi, size=(self.pop_size, self.n_vessels))
        # Shore power Q-bits in equal superposition
        self.q_shore = np.full(
            (self.pop_size, self.n_vessels, 2),
            1.0 / math.sqrt(2.0),
            dtype=np.float64
        )

    def _collapse_individual(self, ind_idx: int) -> List[Dict[str, Any]]:
        """Samples classical discrete and continuous deployment decisions from Q-bit probabilities."""
        chromosome = []
        for v_idx in range(self.n_vessels):
            vessel = self.problem.fleet[v_idx]

            # 1. Route choice: sample from |c_r|^2
            route_probs = self.q_route[ind_idx, v_idx, :] ** 2
            route_probs /= np.sum(route_probs)
            sampled_r = int(self.rng.choice(self.n_routes + 1, p=route_probs))
            route_idx = sampled_r - 1  # -1 is idle, 0..R-1 is route

            # 2. Fuel choice: sample from |d_f|^2 (filtered by vessel compatibility)
            fuel_probs = self.q_fuel[ind_idx, v_idx, :].copy() ** 2
            # Mask incompatible fuels to zero probability
            for f_i, f_type in enumerate(self.fuel_types):
                if f_type not in vessel.compatible_fuels:
                    fuel_probs[f_i] = 0.0
            if np.sum(fuel_probs) > 0:
                fuel_probs /= np.sum(fuel_probs)
                sampled_f = int(self.rng.choice(self.n_fuels, p=fuel_probs))
            else:
                sampled_f = self.fuel_types.index(vessel.compatible_fuels[0])
            fuel_type = self.fuel_types[sampled_f]

            # 3. Cruising speed from phase angle: v = v_min + (v_max - v_min) * sin^2(theta)
            theta_s = self.theta_speed[ind_idx, v_idx]
            speed = vessel.min_speed_knots + (vessel.max_speed_knots - vessel.min_speed_knots) * (math.sin(theta_s) ** 2)

            # 4. Shore power from Q-bit: |beta|^2
            shore_prob = self.q_shore[ind_idx, v_idx, 1] ** 2
            shore_power = bool(self.rng.uniform(0, 1) < shore_prob)

            chromosome.append({
                "route_idx": route_idx,
                "fuel_type": fuel_type,
                "speed_knots": speed,
                "shore_power": shore_power,
                "round_trips": 1
            })

        return chromosome

    def _quantum_rotation_update(
        self,
        ind_idx: int,
        current_chrom: List[Dict[str, Any]],
        elite_chrom: List[Dict[str, Any]]
    ):
        """
        Applies quantum rotation gates towards elite solution decisions.
        Increases amplitude of elite decision state while preserving unitary normalization.
        """
        for v_idx in range(self.n_vessels):
            target_r = elite_chrom[v_idx]["route_idx"] + 1  # convert to 0..n_routes
            curr_r = current_chrom[v_idx]["route_idx"] + 1

            # Rotate route amplitude toward target_r
            if target_r != curr_r:
                self.q_route[ind_idx, v_idx, target_r] += math.sin(self.rotation_step)
                # Re-normalize
                norm_r = np.linalg.norm(self.q_route[ind_idx, v_idx, :])
                self.q_route[ind_idx, v_idx, :] /= max(1e-6, norm_r)

            # Rotate fuel amplitude toward target fuel
            target_f = self.fuel_types.index(elite_chrom[v_idx]["fuel_type"])
            curr_f = self.fuel_types.index(current_chrom[v_idx]["fuel_type"])
            if target_f != curr_f:
                self.q_fuel[ind_idx, v_idx, target_f] += math.sin(self.rotation_step)
                norm_f = np.linalg.norm(self.q_fuel[ind_idx, v_idx, :])
                self.q_fuel[ind_idx, v_idx, :] /= max(1e-6, norm_f)

            # Adjust speed phase angle toward elite speed
            target_spd = elite_chrom[v_idx]["speed_knots"]
            curr_spd = current_chrom[v_idx]["speed_knots"]
            delta_spd = target_spd - curr_spd
            self.theta_speed[ind_idx, v_idx] += np.sign(delta_spd) * 0.05
            self.theta_speed[ind_idx, v_idx] = max(0.0, min(0.5 * math.pi, self.theta_speed[ind_idx, v_idx]))

    def _check_and_apply_catastrophe(self):
        """Quantum catastrophe operator to restore population diversity and prevent stagnation."""
        # Calculate route entropy across population
        var_route = np.var(self.q_route ** 2, axis=0).mean()
        if var_route < self.catastrophe_threshold:
            # Diversity collapsed; reset 35% non-elite population to equal superposition
            reset_count = int(0.35 * self.pop_size)
            reset_indices = self.rng.choice(self.pop_size, size=reset_count, replace=False)
            self.q_route[reset_indices, :, :] = 1.0 / math.sqrt(self.n_routes + 1)
            self.q_fuel[reset_indices, :, :] = 1.0 / math.sqrt(self.n_fuels)
            self.theta_speed[reset_indices, :] = self.rng.uniform(0.1, 0.4 * math.pi, size=(reset_count, self.n_vessels))

    def solve(self) -> Dict[str, Any]:
        """
        Executes the full MO-QIEA optimization run.
        Returns Pareto frontier solutions, convergence telemetry, and execution metadata.
        """
        t_start = time.perf_counter()
        total_evaluations = 0

        # Normalization reference for hypervolume calculation
        ref_point_fuel_cost = (25000.0, 25000000.0)

        for gen in range(1, self.generations + 1):
            gen_chromosomes = []
            gen_solutions = []
            gen_objectives = np.zeros((self.pop_size, 3), dtype=np.float64)

            # 1. Observation and Evaluation
            for i in range(self.pop_size):
                raw_chrom = self._collapse_individual(i)
                repaired_chrom = self.problem.create_repaired_chromosome(raw_chrom)
                objs, sol = self.problem.evaluate_candidate(repaired_chrom, apply_repair=True)
                sol.solution_id = f"moqiea_g{gen}_i{i}"
                sol.algorithm = "MO-QIEA"

                gen_chromosomes.append(repaired_chrom)
                gen_solutions.append(sol)
                gen_objectives[i] = objs
                total_evaluations += 1

            # 2. Fast Non-Dominated Sorting
            fronts = fast_non_dominated_sort(gen_objectives)
            front1_indices = fronts[0]

            # 3. Update Global External Archive with all feasible solutions
            for idx in range(self.pop_size):
                sol = gen_solutions[idx]
                if sol.is_feasible:
                    sol.pareto_rank = 1
                    self.archive_solutions.append(sol)
                    self.archive_objectives.append(tuple(gen_objectives[idx]))
                    self.archive_chromosomes.append(gen_chromosomes[idx])

            # Prune external archive to keep only non-dominated solutions
            if len(self.archive_objectives) > 1:
                arch_arr = np.array(self.archive_objectives)
                arch_fronts = fast_non_dominated_sort(arch_arr)
                elite_arch_indices = arch_fronts[0]

                # Keep top 50 non-dominated archive solutions
                self.archive_solutions = [self.archive_solutions[k] for k in elite_arch_indices][:50]
                self.archive_objectives = [self.archive_objectives[k] for k in elite_arch_indices][:50]
                self.archive_chromosomes = [self.archive_chromosomes[k] for k in elite_arch_indices][:50]

            # 4. Quantum Rotation Gates toward Pareto Archive Elites
            if len(self.archive_chromosomes) > 0:
                for ind_idx in range(self.pop_size):
                    elite_idx = self.rng.choice(len(self.archive_chromosomes))
                    elite_chrom = self.archive_chromosomes[elite_idx]
                    self._quantum_rotation_update(ind_idx, gen_chromosomes[ind_idx], elite_chrom)

            # 5. Catastrophe Mutation
            self._check_and_apply_catastrophe()

            # 6. Record Generation Telemetry
            best_fuel = float(np.min(gen_objectives[:, 0]))
            best_cost = float(np.min(gen_objectives[:, 1]))
            best_ghg = float(np.min(gen_objectives[:, 2]))

            # Normalized 2D hypervolume (fuel vs cost)
            pts_2d = gen_objectives[:, :2]
            hv = compute_hypervolume_2d(pts_2d, ref_point_fuel_cost) / (ref_point_fuel_cost[0] * ref_point_fuel_cost[1])
            diversity = float(np.mean(np.var(self.q_route ** 2, axis=0)))

            self.convergence_history.append({
                "generation": gen,
                "best_fuel_mt": round(best_fuel, 1),
                "best_cost_usd": round(best_cost, 1),
                "best_ghg_tco2e": round(best_ghg, 1),
                "hypervolume": round(hv, 4),
                "population_diversity": round(diversity, 4)
            })

        execution_time = time.perf_counter() - t_start

        # Calculate Crowding Distance for Final Archive Solutions
        if len(self.archive_solutions) > 0:
            arch_arr = np.array(self.archive_objectives)
            crowd_dist = calculate_crowding_distance(arch_arr, list(range(len(self.archive_solutions))))
            for idx, sol in enumerate(self.archive_solutions):
                sol.crowding_distance = round(crowd_dist[idx], 4) if not math.isinf(crowd_dist[idx]) else 999.0

        # Select Knee-point (Best Compromise Solution on Normalized Front)
        compromise_id = ""
        if len(self.archive_solutions) > 0:
            arch_arr = np.array(self.archive_objectives)
            min_objs = np.min(arch_arr, axis=0)
            max_objs = np.max(arch_arr, axis=0)
            diffs = np.where(max_objs - min_objs < 1e-6, 1.0, max_objs - min_objs)
            norm_objs = (arch_arr - min_objs) / diffs
            # Ideal point is (0, 0, 0); find minimum Euclidean distance to ideal point
            dists_to_ideal = np.linalg.norm(norm_objs, axis=1)
            knee_idx = int(np.argmin(dists_to_ideal))
            compromise_id = self.archive_solutions[knee_idx].solution_id

        return {
            "algorithm": "MO-QIEA",
            "execution_time_seconds": round(execution_time, 2),
            "total_evaluations": total_evaluations,
            "generations_completed": self.generations,
            "pareto_front": self.archive_solutions,
            "compromise_solution_id": compromise_id,
            "convergence_history": self.convergence_history
        }
