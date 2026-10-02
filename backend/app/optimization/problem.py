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
        demand_multiplier: float = 1.0
    ):
        self.fleet = fleet if fleet is not None else STANDARD_FLEET
        self.corridors = corridors if corridors is not None else GLOBAL_CORRIDORS
        self.corridor_list = list(self.corridors.values())
        self.carbon_tax_per_ton = carbon_tax_per_ton
        self.weather_severity_multiplier = weather_severity_multiplier
        self.demand_multiplier = demand_multiplier
        self.fuel_price_multipliers = fuel_price_multipliers or {}

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
            speed = float(gene.get("speed_knots", vessel.design_speed_knots))
            speed = max(vessel.min_speed_knots, min(vessel.max_speed_knots, speed))

            fuel_type: FuelType = gene.get("fuel_type", FuelType.VLSFO)
            shore_power: bool = bool(gene.get("shore_power", False))
            round_trips = max(1, int(gene.get("round_trips", 1)))

            # Constraint: Engine-Fuel Compatibility Check
            vessel_violation = []
            if fuel_type not in vessel.compatible_fuels:
                if apply_repair:
                    # Repair to default compatible fuel (e.g. VLSFO or MGO)
                    fuel_type = vessel.compatible_fuels[0]
                else:
                    vessel_violation.append(f"Incompatible fuel {fuel_type} for vessel {vessel.name}")

            # Constraint: ECA Compliance
            if corridor.is_eca_corridor and fuel_type == FuelType.VLSFO:
                if apply_repair:
                    fuel_type = FuelType.MGO  # repair to low sulfur MGO
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

            hydro = compute_hydrodynamic_fuel(
                vessel_type=vessel.vessel_type,
                dwt=vessel.dwt,
                speed_knots=speed,
                cargo_load_ratio=0.85,
                draft_meters=vessel.design_draft_meters * 0.92,
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
                        speed = max(speed, required_speed)
                        transit_hours = corridor.distance_nm / speed
                        transit_days = transit_hours / 24.0
                        total_voyage_days = (transit_days + turnaround_days) * round_trips
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

            # Voyage Operational Cost
            base_fuel_price = fuel_spec.default_cost_usd_per_mt
            multiplier = self.fuel_price_multipliers.get(fuel_type.value, 1.0)
            fuel_cost_usd = sea_fuel_voyage_mt * (base_fuel_price * multiplier)
            charter_cost_usd = vessel.daily_capital_cost_usd * total_voyage_days
            carbon_tax_usd = voyage_ghg_tco2e * self.carbon_tax_per_ton
            voyage_cost_usd = fuel_cost_usd + charter_cost_usd + berth_cost_usd + carbon_tax_usd

            # Cargo Delivered
            cargo_delivered = vessel.capacity_teu_or_dwt * 0.90 * round_trips
            route_carried[corridor.route_id] += cargo_delivered

            total_vessel_fuel_mt = sea_fuel_voyage_mt + berth_fuel_mt
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
                violation_reasons=vessel_violation
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
                # Apply quadratic penalty to objectives to enforce hard constraint
                shortfall_ratio = shortfall / target
                penalty_fuel = shortfall_ratio * 3000.0
                penalty_cost = shortfall_ratio * 2500000.0
                penalty_ghg = shortfall_ratio * 8000.0
                total_fuel_mt += penalty_fuel
                total_cost_usd += penalty_cost
                total_ghg_tco2e += penalty_ghg

        is_feasible = (len(violations) == 0) and (demand_satisfaction_pct >= 99.9)

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
            allocations=allocations
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
                    chromosome[best_v_idx]["fuel_type"] = FuelType.MGO

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
