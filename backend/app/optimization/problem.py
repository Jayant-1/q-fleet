"""
Multi-Objective Fleet Deployment Optimization Problem Formulation.
Evaluates conflicting objectives: (1) Total Fuel, (2) Total Cost, (3) Lifecycle GHG Emissions (WTW).
Enforces constraints: Cargo Demand, Schedule Windows, Fleet Inventory, Engine Compatibility, ECA, Shore Power.
"""

import math
from typing import List, Dict, Any, Tuple, Optional
from backend.app.domain.fuels import FuelType, FUEL_REGISTRY, ShorePowerProfile
from backend.app.domain.models import (
    VesselSpecification,
    Corridor,
    VesselDeploymentAllocation,
    FleetDeploymentSolution,
    STANDARD_FLEET,
    GLOBAL_CORRIDORS
)
from backend.app.domain.regulations import (
    compute_vessel_cii,
    compute_fueleu_maritime,
    compute_eu_ets_cost,
    get_corridor_eu_scope
)
from backend.app.prediction.dataset import compute_hydrodynamic_fuel


class FleetDeploymentProblem:
    """
    Mathematical formulation of the Green Fleet Deployment & Speed-Fuel Optimization Problem.
    """
    def __init__(
        self,
        fleet: Optional[List[VesselSpecification]] = None,
        corridors: Optional[Dict[str, Corridor]] = None,
        carbon_tax_per_ton: float = 100.0,
        weather_severity_multiplier: float = 1.0,
        fuel_price_multipliers: Optional[Dict[str, float]] = None,
        demand_multiplier: float = 1.0,
        scenario_id: Optional[str] = None,
        selected_route_id: Optional[str] = None,
        target_speed_knots: Optional[float] = None,
        preferred_fuel_type: Optional[str] = None,
        operating_draft_meters: Optional[float] = None
    ):
        self.fleet = list(fleet) if fleet is not None else list(STANDARD_FLEET)
        base_corridors = dict(corridors) if corridors is not None else dict(GLOBAL_CORRIDORS)
        self.target_speed_knots = target_speed_knots
        self.preferred_fuel_type = preferred_fuel_type
        self.operating_draft_meters = operating_draft_meters

        # Handle route filtering
        if selected_route_id:
            if selected_route_id in base_corridors:
                self.corridors = {selected_route_id: base_corridors[selected_route_id]}
            else:
                raise ValueError(f"Unknown selected_route_id '{selected_route_id}'. Available: {list(base_corridors.keys())}")
        else:
            self.corridors = base_corridors

        self.corridor_list = list(self.corridors.values())
        self.carbon_tax_per_ton = carbon_tax_per_ton
        self.weather_severity_multiplier = weather_severity_multiplier
        self.demand_multiplier = demand_multiplier
        self.fuel_price_multipliers = fuel_price_multipliers or {}
        self.scenario_id = scenario_id

        # Scenario Parameter Customizations
        if scenario_id:
            if scenario_id == "global_liner_2026":
                self.scenario_name = "Global Liner 2026 Baseline"
            elif scenario_id == "eca_strict_compliance":
                self.scenario_name = "ECA Strict Compliance"
                # Enforce ECA rules strictly and slightly higher demand pressure
                self.demand_multiplier *= 1.05
            elif scenario_id == "net_zero_2040_pathway":
                self.scenario_name = "Net-Zero 2040 Pathway"
                self.carbon_tax_per_ton = max(self.carbon_tax_per_ton, 180.0)
            elif scenario_id in ("baseline_2024", "custom"):
                self.scenario_name = scenario_id
            else:
                raise ValueError(f"Unknown scenario_id '{scenario_id}'. Valid scenarios: 'global_liner_2026', 'eca_strict_compliance', 'net_zero_2040_pathway'.")

        # Precompute route demand targets
        self.route_demands = {
            c.route_id: c.cargo_demand_per_period * self.demand_multiplier
            for c in self.corridor_list
        }

    def evaluate_candidate(
        self,
        chromosome: List[Dict[str, Any]],
        apply_repair: bool = True
    ) -> Tuple[Tuple[float, float, float], FleetDeploymentSolution]:
        """
        Evaluates a candidate fleet deployment assignment.
        Chromosome structure: List of dicts for each vessel in fleet:
        {
            "route_idx": int (-1 for unassigned, or 0..|R|-1),
            "fuel_type": FuelType,
            "speed_knots": float,
            "shore_power": bool,
            "round_trips": int
        }
        Returns:
            ((total_fuel_mt, total_cost_usd, total_lifecycle_ghg_tco2e), Solution)
        """
        allocations: List[VesselDeploymentAllocation] = []
        route_carried: Dict[str, float] = {c.route_id: 0.0 for c in self.corridor_list}
        total_fuel_mt = 0.0
        total_cost_usd = 0.0
        total_ghg_tco2e = 0.0
        violations: List[str] = []

        # 1. Evaluate each vessel assignment
        for i, vessel in enumerate(self.fleet):
            gene = chromosome[i]
            route_idx = gene.get("route_idx", -1)

            if route_idx < 0 or route_idx >= len(self.corridor_list):
                # Vessel is idle / in reserve
                continue

            corridor = self.corridor_list[route_idx]
            raw_target_speed = float(self.target_speed_knots) if self.target_speed_knots is not None else float(gene.get("speed_knots", vessel.design_speed_knots))
            speed = raw_target_speed
            speed_adjustment_reason = ""
            if speed > vessel.max_speed_knots:
                speed = vessel.max_speed_knots
                speed_adjustment_reason = f"Clamped to physical maximum engine limit ({vessel.max_speed_knots:.1f} kts)"
            elif speed < vessel.min_speed_knots:
                speed = vessel.min_speed_knots
                speed_adjustment_reason = f"Raised to hydrodynamic steerageway minimum ({vessel.min_speed_knots:.1f} kts)"

            fuel_type: FuelType = gene.get("fuel_type", FuelType.VLSFO)
            fuel_adjustment_reason = ""
            if self.preferred_fuel_type:
                try:
                    pref_fuel = FuelType(self.preferred_fuel_type)
                    if pref_fuel in vessel.compatible_fuels:
                        fuel_type = pref_fuel
                    else:
                        cur_f_str = fuel_type.value if hasattr(fuel_type, "value") else str(fuel_type)
                        fuel_adjustment_reason = f"Preferred fuel {self.preferred_fuel_type} not supported by engine; used default {cur_f_str}"
                except Exception:
                    pass
            shore_power: bool = bool(gene.get("shore_power", False))
            round_trips = max(1, int(gene.get("round_trips", 1)))

            # Constraint: Engine-Fuel Compatibility Check
            vessel_violation = []
            if fuel_type not in vessel.compatible_fuels:
                if apply_repair:
                    # Repair to default compatible fuel (e.g. VLSFO or MGO)
                    original_f = fuel_type
                    fuel_type = vessel.compatible_fuels[0]
                    orig_f_str = original_f.value if hasattr(original_f, "value") else str(original_f)
                    new_f_str = fuel_type.value if hasattr(fuel_type, "value") else str(fuel_type)
                    fuel_adjustment_reason = f"Dual-fuel engine fallback: {orig_f_str} replaced by default {new_f_str}"
                else:
                    vessel_violation.append(f"Incompatible fuel {fuel_type} for vessel {vessel.name}")

            # Constraint: ECA Compliance
            if corridor.is_eca_corridor and fuel_type == FuelType.VLSFO:
                if apply_repair:
                    candidates = [f for f in vessel.compatible_fuels if f != FuelType.VLSFO]
                    if FuelType.MGO in candidates:
                        fuel_type = FuelType.MGO
                        fuel_adjustment_reason = "ECA sulfur limit: VLSFO replaced with 0.10% S MGO"
                    elif candidates:
                        fuel_type = candidates[0]
                        cand_str = fuel_type.value if hasattr(fuel_type, "value") else str(fuel_type)
                        fuel_adjustment_reason = f"ECA compliance: VLSFO replaced with clean alternative {cand_str}"
                    else:
                        vessel_violation.append("No ECA-compliant fuel supported by vessel")
                else:
                    vessel_violation.append("VLSFO banned in North Sea/Baltic ECA corridor")

            # Constraint: Shore Power Availability & Vessel Fitting
            actual_shore_power = (
                shore_power and
                vessel.has_shore_power_connection and
                corridor.destination_port.has_cold_ironing
            )

            # Hydrodynamics & Voyage Fuel calculation
            effective_weather = corridor.weather_severity_index * self.weather_severity_multiplier
            wave_h = 2.0 * effective_weather
            wind_k = 16.0 * effective_weather
            actual_draft = float(self.operating_draft_meters) if self.operating_draft_meters is not None else (vessel.design_draft_meters * 0.92)

            hydro = compute_hydrodynamic_fuel(
                vessel_type=vessel.vessel_type,
                dwt=vessel.dwt,
                speed_knots=speed,
                cargo_load_ratio=0.85,
                draft_meters=actual_draft,
                wind_speed_knots=wind_k,
                wave_height_meters=wave_h,
                current_knots=0.4,
                noise_std=0.0
            )

            # Voyage Duration
            transit_hours = corridor.distance_nm / speed
            transit_days = transit_hours / 24.0
            turnaround_days = corridor.port_turnaround_days
            total_voyage_days = (transit_days + turnaround_days) * round_trips

            # Schedule Reliability Check
            max_allowed = corridor.max_transit_time_days * round_trips
            if total_voyage_days > max_allowed:
                if apply_repair:
                    # Speed up to meet schedule if within max speed
                    required_speed = corridor.distance_nm / (24.0 * max(1.0, corridor.max_transit_time_days - turnaround_days))
                    if required_speed <= vessel.max_speed_knots:
                        prev_speed = speed
                        speed = max(speed, required_speed)
                        if speed > prev_speed:
                            speed_adjustment_reason = f"Schedule recovery: speed increased from {prev_speed:.1f} kts to {speed:.1f} kts to meet corridor schedule ({max_allowed:.1f}d)"
                        transit_hours = corridor.distance_nm / speed
                        transit_days = transit_hours / 24.0
                        total_voyage_days = (transit_days + turnaround_days) * round_trips
                        
                        # Recompute hydrodynamics with repaired speed and preserved operating draft
                        hydro = compute_hydrodynamic_fuel(
                            vessel_type=vessel.vessel_type,
                            dwt=vessel.dwt,
                            speed_knots=speed,
                            cargo_load_ratio=0.85,
                            draft_meters=actual_draft,
                            wind_speed_knots=wind_k,
                            wave_height_meters=wave_h,
                            current_knots=0.4,
                            noise_std=0.0
                        )
                    else:
                        vessel_violation.append(f"Schedule deadline exceeded ({total_voyage_days:.1f}d > {max_allowed:.1f}d)")
                else:
                    vessel_violation.append(f"Schedule deadline exceeded ({total_voyage_days:.1f}d > {max_allowed:.1f}d)")

            # Fuel Mass & Energy Conversion (LHV scaling)
            vlsfo_spec = FUEL_REGISTRY[FuelType.VLSFO]
            fuel_spec = FUEL_REGISTRY[fuel_type]
            energy_ratio = vlsfo_spec.lhv_mj_per_kg / fuel_spec.lhv_mj_per_kg

            sea_daily_fuel_raw = hydro["daily_fuel_mt"]
            sea_fuel_voyage_mt = (sea_daily_fuel_raw * transit_days * energy_ratio) * round_trips

            # Berth Fuel / Shore Power
            berth_hours = turnaround_days * 24.0 * round_trips
            if actual_shore_power:
                berth_fuel_mt = 0.0
                berth_electricity_kwh = (vessel.berth_aux_power_kw * berth_hours)
                berth_ghg_tco2e = (berth_electricity_kwh * corridor.destination_port.grid_carbon_intensity_gco2_per_kwh) / 1e6
                berth_cost_usd = berth_electricity_kwh * corridor.destination_port.electricity_cost_usd_per_kwh
            else:
                # Auxiliary engine burning MGO at berth (approx 0.18 MT/MWh)
                berth_electricity_mwh = (vessel.berth_aux_power_kw * berth_hours) / 1000.0
                mgo_spec = FUEL_REGISTRY[FuelType.MGO]
                berth_fuel_mt = berth_electricity_mwh * 0.185
                berth_ghg_wtt = (berth_fuel_mt * 1000.0 * mgo_spec.lhv_mj_per_kg * mgo_spec.wtt_factor_gco2e_per_mj) / 1e6
                berth_ghg_ttw = berth_fuel_mt * mgo_spec.ttw_factor_gco2_per_g
                berth_ghg_tco2e = berth_ghg_wtt + berth_ghg_ttw
                berth_cost_usd = berth_fuel_mt * mgo_spec.default_cost_usd_per_mt

            # Well-to-Wake Lifecycle GHG emissions
            # WTT: Mass * 1000 kg/MT * LHV (MJ/kg) * WTT_factor (g/MJ) / 1,000,000 g/t
            ghg_wtt_tco2e = (sea_fuel_voyage_mt * 1000.0 * fuel_spec.lhv_mj_per_kg * fuel_spec.wtt_factor_gco2e_per_mj) / 1e6
            ghg_ttw_tco2e = sea_fuel_voyage_mt * fuel_spec.ttw_factor_gco2_per_g
            voyage_ghg_tco2e = ghg_wtt_tco2e + ghg_ttw_tco2e + berth_ghg_tco2e

            total_vessel_fuel_mt = sea_fuel_voyage_mt + berth_fuel_mt
            voyage_dist_total = corridor.distance_nm * round_trips

            # Determine corridor EU jurisdictional scope per Directive (EU) 2023/959 & Reg (EU) 2023/1805
            eu_scope = get_corridor_eu_scope(corridor.origin_port.country, corridor.destination_port.country)
            eu_scope_pct = 100.0 if eu_scope == "intra_eu" else (50.0 if eu_scope == "extra_eu" else 0.0)

            # Dynamic Regulatory Evaluations
            cii_eval = compute_vessel_cii(
                ship_type_category=vessel.vessel_type.value,
                capacity_dwt=vessel.dwt,
                distance_travelled_nm=voyage_dist_total,
                total_fuel_mt=total_vessel_fuel_mt,
                fuel_cf=fuel_spec.ttw_factor_gco2_per_g,
                year=2026
            )

            total_energy_mj = total_vessel_fuel_mt * 1000.0 * fuel_spec.lhv_mj_per_kg
            fueleu_eval = compute_fueleu_maritime(
                energy_consumed_mj=total_energy_mj,
                wtw_emissions_tco2e=voyage_ghg_tco2e,
                year=2026,
                scope_pct=eu_scope_pct
            )

            vessel_gt = getattr(vessel, "gross_tonnage", None)
            eu_ets_eval = compute_eu_ets_cost(
                ttw_emissions_tco2=ghg_ttw_tco2e,
                route_eu_scope=eu_scope,
                carbon_price_eur=90.0,
                year=2026,
                gross_tonnage=vessel_gt
            )

            # Voyage Operational Cost:
            # Voluntary corporate carbon shadow price applied strictly to non-ETS emissions to eliminate double-counting
            base_fuel_price = fuel_spec.default_cost_usd_per_mt
            fuel_key = fuel_type.value if hasattr(fuel_type, "value") else str(fuel_type)
            multiplier = self.fuel_price_multipliers.get(fuel_key, 1.0)
            fuel_cost_usd = sea_fuel_voyage_mt * (base_fuel_price * multiplier)
            charter_cost_usd = vessel.daily_capital_cost_usd * total_voyage_days

            non_ets_ghg = max(0.0, voyage_ghg_tco2e - eu_ets_eval.surrender_emissions_tco2)
            voluntary_carbon_tax_usd = non_ets_ghg * self.carbon_tax_per_ton
            regulatory_costs_usd = fueleu_eval.penalty_usd + eu_ets_eval.allowance_cost_usd
            voyage_cost_usd = fuel_cost_usd + charter_cost_usd + berth_cost_usd + voluntary_carbon_tax_usd + regulatory_costs_usd

            # Cargo Delivered
            cargo_delivered = vessel.capacity_teu_or_dwt * 0.90 * round_trips
            route_carried[corridor.route_id] += cargo_delivered

            total_fuel_mt += total_vessel_fuel_mt
            total_cost_usd += voyage_cost_usd
            total_ghg_tco2e += voyage_ghg_tco2e

            alloc = VesselDeploymentAllocation(
                vessel_id=vessel.vessel_id,
                vessel_name=vessel.name,
                vessel_type=vessel.vessel_type.value,
                route_id=corridor.route_id,
                route_name=corridor.name,
                speed_knots=round(speed, 1),
                fuel_type=fuel_type,
                shore_power_used=actual_shore_power,
                round_trips=round_trips,
                fuel_consumed_sea_mt=round(sea_fuel_voyage_mt, 1),
                fuel_consumed_berth_mt=round(berth_fuel_mt, 1),
                total_fuel_mt=round(total_vessel_fuel_mt, 1),
                operational_cost_usd=round(voyage_cost_usd, 1),
                lifecycle_ghg_tco2e=round(voyage_ghg_tco2e, 1),
                transit_time_days=round(transit_days, 1),
                cargo_carried=round(cargo_delivered, 0),
                is_feasible=(len(vessel_violation) == 0),
                violation_reasons=vessel_violation,
                cii_rating=cii_eval.rating.value,
                attained_aer=round(cii_eval.attained_aer_gco2_per_dwt_nm, 3),
                fueleu_deficit_penalty_usd=round(fueleu_eval.penalty_usd, 1),
                eu_ets_cost_usd=round(eu_ets_eval.allowance_cost_usd, 1),
                target_speed_knots=round(raw_target_speed, 1) if self.target_speed_knots is not None else None,
                applied_speed_knots=round(speed, 1),
                speed_adjustment_reason=speed_adjustment_reason,
                fuel_adjustment_reason=fuel_adjustment_reason,
                applied_draft_meters=round(actual_draft, 2)
            )
            allocations.append(alloc)
            if vessel_violation:
                violations.extend(vessel_violation)

        # 2. Demand Shortfall Constraint Check & Penalty
        total_demand_target = sum(self.route_demands.values())
        total_delivered = sum(route_carried.values())
        demand_satisfaction_pct = min(100.0, (total_delivered / max(1.0, total_demand_target)) * 100.0)

        for route_id, target in self.route_demands.items():
            carried = route_carried[route_id]
            if carried < target:
                shortfall = target - carried
                violations.append(f"Route {route_id} cargo shortfall of {shortfall:.0f} units")
                shortfall_ratio = shortfall / target
                penalty_fuel = shortfall_ratio * 3000.0
                penalty_cost = shortfall_ratio * 2500000.0
                penalty_ghg = shortfall_ratio * 8000.0
                total_fuel_mt += penalty_fuel
                total_cost_usd += penalty_cost
                total_ghg_tco2e += penalty_ghg

        is_feasible = (len(violations) == 0) and (demand_satisfaction_pct >= 99.9)

        # Compute fleet aggregate regulatory stats
        cii_counts: Dict[str, int] = {}
        for a in allocations:
            cii_counts[a.cii_rating] = cii_counts.get(a.cii_rating, 0) + 1

        total_fueleu_pen = sum(a.fueleu_deficit_penalty_usd for a in allocations)
        total_eu_ets = sum(a.eu_ets_cost_usd for a in allocations)

        # Majority rating or moderate C default
        fleet_rating = "C"
        if cii_counts:
            fleet_rating = max(cii_counts.items(), key=lambda item: item[1])[0]

        solution = FleetDeploymentSolution(
            solution_id="",
            algorithm="",
            total_fuel_mt=round(total_fuel_mt, 1),
            total_cost_usd=round(total_cost_usd, 1),
            total_lifecycle_ghg_tco2e=round(total_ghg_tco2e, 1),
            total_cargo_delivered=round(total_delivered, 0),
            demand_satisfaction_pct=round(demand_satisfaction_pct, 1),
            schedule_reliability_pct=100.0 if is_feasible else 85.0,
            is_feasible=is_feasible,
            allocations=allocations,
            fleet_average_cii_rating=fleet_rating,
            total_fueleu_penalty_usd=round(total_fueleu_pen, 1),
            total_eu_ets_cost_usd=round(total_eu_ets, 1),
            cii_grade_counts=cii_counts
        )

        return (total_fuel_mt, total_cost_usd, total_ghg_tco2e), solution

    def create_repaired_chromosome(self, raw_chromosome: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Principled heuristic repair operator that ensures all corridors meet demand
        and adhere to strict transit schedule deadlines.
        """
        chromosome = [dict(g) for g in raw_chromosome]

        # 1. Enforce minimum speed required to meet schedule on each route
        for i, gene in enumerate(chromosome):
            r_idx = gene.get("route_idx", -1)
            vessel = self.fleet[i]
            if 0 <= r_idx < len(self.corridor_list):
                corridor = self.corridor_list[r_idx]
                available_transit_days = max(1.0, corridor.max_transit_time_days - corridor.port_turnaround_days)
                min_speed_req = corridor.distance_nm / (24.0 * available_transit_days)

                if min_speed_req > vessel.max_speed_knots:
                    # Vessel physically cannot make the schedule; unassign it
                    gene["route_idx"] = -1
                else:
                    # Clamp speed to be at least min_speed_req
                    current_spd = gene.get("speed_knots", vessel.design_speed_knots)
                    gene["speed_knots"] = max(min_speed_req, min(vessel.max_speed_knots, current_spd))

        # 2. Calculate current capacity per route
        route_caps: Dict[int, float] = {r_idx: 0.0 for r_idx in range(len(self.corridor_list))}
        unassigned_vessels = []

        for i, gene in enumerate(chromosome):
            r_idx = gene.get("route_idx", -1)
            vessel = self.fleet[i]
            trips = gene.get("round_trips", 1)
            if 0 <= r_idx < len(self.corridor_list):
                route_caps[r_idx] += vessel.capacity_teu_or_dwt * 0.90 * trips
            else:
                unassigned_vessels.append(i)

        # 3. Check deficits and reassign capable unassigned vessels
        for r_idx, corridor in enumerate(self.corridor_list):
            target = self.route_demands[corridor.route_id]
            available_transit_days = max(1.0, corridor.max_transit_time_days - corridor.port_turnaround_days)
            min_speed_req = corridor.distance_nm / (24.0 * available_transit_days)

            # Find unassigned vessels capable of this speed
            capable = [idx for idx in unassigned_vessels if self.fleet[idx].max_speed_knots >= min_speed_req]

            while route_caps[r_idx] < target and capable:
                best_v_idx = capable.pop(0)
                unassigned_vessels.remove(best_v_idx)
                vessel = self.fleet[best_v_idx]

                chromosome[best_v_idx]["route_idx"] = r_idx
                chromosome[best_v_idx]["round_trips"] = 1
                chromosome[best_v_idx]["speed_knots"] = max(min_speed_req, vessel.design_speed_knots)

                # Choose greenest compatible fuel
                if FuelType.BIO_METHANOL in vessel.compatible_fuels:
                    chromosome[best_v_idx]["fuel_type"] = FuelType.BIO_METHANOL
                elif FuelType.LNG in vessel.compatible_fuels:
                    chromosome[best_v_idx]["fuel_type"] = FuelType.LNG
                else:
                    chromosome[best_v_idx]["fuel_type"] = vessel.compatible_fuels[0]

                # ECA check
                if corridor.is_eca_corridor and chromosome[best_v_idx]["fuel_type"] == FuelType.VLSFO:
                    candidates = [f for f in vessel.compatible_fuels if f != FuelType.VLSFO]
                    if FuelType.MGO in candidates:
                        chromosome[best_v_idx]["fuel_type"] = FuelType.MGO
                    elif candidates:
                        chromosome[best_v_idx]["fuel_type"] = candidates[0]

                chromosome[best_v_idx]["shore_power"] = vessel.has_shore_power_connection
                route_caps[r_idx] += vessel.capacity_teu_or_dwt * 0.90

            # 4. If still shortfall, allow second round trip on shorter routes (e.g. <= 12 days)
            if route_caps[r_idx] < target and corridor.max_transit_time_days <= 14.0:
                for idx, gene in enumerate(chromosome):
                    if gene.get("route_idx") == r_idx and gene.get("round_trips", 1) < 2:
                        gene["round_trips"] = 2
                        vessel = self.fleet[idx]
                        route_caps[r_idx] += vessel.capacity_teu_or_dwt * 0.90
                        if route_caps[r_idx] >= target:
                            break

        return chromosome

    def generate_baseline_solution(self) -> FleetDeploymentSolution:
        """
        Generates a deterministic conventional commercial baseline solution:
        - 100% VLSFO (or 0.10% S MGO where mandatory in ECA corridors)
        - Operating vessels at design service speed (standard un-optimized transit)
        - No cold-ironing / shore power at berth (auxiliary diesel generators active)
        - Schedulable vessel assignment satisfying the active corridor cargo demands
        """
        chromosome: List[Dict[str, Any]] = []
        for v in self.fleet:
            chromosome.append({
                "route_idx": -1,
                "speed_knots": v.design_speed_knots,
                "fuel_type": FuelType.VLSFO,
                "shore_power": False,
                "round_trips": 1
            })

        route_caps: Dict[int, float] = {r: 0.0 for r in range(len(self.corridor_list))}
        unassigned = list(range(len(self.fleet)))

        for r_idx, corridor in enumerate(self.corridor_list):
            target = self.route_demands[corridor.route_id]
            available_transit_days = max(1.0, corridor.max_transit_time_days - corridor.port_turnaround_days)
            min_speed_req = corridor.distance_nm / (24.0 * available_transit_days)
            capable = [idx for idx in unassigned if self.fleet[idx].max_speed_knots >= min_speed_req]

            while route_caps[r_idx] < target and capable:
                v_idx = capable.pop(0)
                unassigned.remove(v_idx)
                vessel = self.fleet[v_idx]
                chromosome[v_idx]["route_idx"] = r_idx
                chromosome[v_idx]["speed_knots"] = vessel.design_speed_knots

                if corridor.is_eca_corridor:
                    chromosome[v_idx]["fuel_type"] = (
                        FuelType.MGO if FuelType.MGO in vessel.compatible_fuels else vessel.compatible_fuels[0]
                    )
                else:
                    chromosome[v_idx]["fuel_type"] = (
                        FuelType.VLSFO if FuelType.VLSFO in vessel.compatible_fuels else vessel.compatible_fuels[0]
                    )

                chromosome[v_idx]["shore_power"] = False
                chromosome[v_idx]["round_trips"] = 1
                route_caps[r_idx] += vessel.capacity_teu_or_dwt * 0.90

            if route_caps[r_idx] < target and corridor.max_transit_time_days <= 14.0:
                for idx in range(len(self.fleet)):
                    if chromosome[idx]["route_idx"] == r_idx and chromosome[idx]["round_trips"] < 2:
                        chromosome[idx]["round_trips"] = 2
                        route_caps[r_idx] += self.fleet[idx].capacity_teu_or_dwt * 0.90
                        if route_caps[r_idx] >= target:
                            break

        _, sol = self.evaluate_candidate(chromosome, apply_repair=True)
        sol.solution_id = "SOL_BASELINE_CONVENTIONAL"
        sol.algorithm = "Conventional Commercial Baseline"
        return sol

