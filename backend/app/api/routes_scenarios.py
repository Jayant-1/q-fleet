"""
FastAPI Routes for Scenario Definitions, Fleets, Corridors, Ports, and Fuel Registry.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.domain.fuels import FUEL_REGISTRY
from backend.app.domain.models import GLOBAL_CORRIDORS, GLOBAL_PORTS, STANDARD_FLEET

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])


@router.get("/list")
def list_available_scenarios():
    """Lists pre-configured maritime decarbonization scenarios."""
    return [
        {
            "scenario_id": "global_liner_2026",
            "name": "Global Maritime Liner Decarbonization 2026",
            "description": "Cross-continental container, bulk, and tanker fleet deployment spanning Asia-Europe, Transpacific, Transatlantic, Indian Ocean, and North Sea ECA.",
            "total_corridors": len(GLOBAL_CORRIDORS),
            "total_fleet_vessels": len(STANDARD_FLEET),
            "total_cargo_demand_teu": sum(c.cargo_demand_per_period for c in GLOBAL_CORRIDORS.values()),
            "default_carbon_tax": 100.0
        },
        {
            "scenario_id": "eca_strict_compliance",
            "name": "ECA Low-Sulfur & Alternative Fuel Mandate",
            "description": "High carbon tax ($180/t) and strict 0.1% sulfur limit enforcing Green Methanol and LNG dual-fuel transition.",
            "total_corridors": 3,
            "total_fleet_vessels": 10,
            "total_cargo_demand_teu": 43500.0,
            "default_carbon_tax": 180.0
        }
    ]


@router.get("/fuels/registry")
def get_fuel_registry():
    """Returns authoritative technical specifications and emission factors for all marine fuels and shore power."""
    fuels_data = []
    for f_code, spec in FUEL_REGISTRY.items():
        fuels_data.append({
            "code": spec.code.value,
            "display_name": spec.display_name,
            "lhv_mj_per_kg": spec.lhv_mj_per_kg,
            "density_kg_per_m3": spec.density_kg_per_m3,
            "wtt_factor_gco2e_per_mj": spec.wtt_factor_gco2e_per_mj,
            "ttw_factor_gco2_per_g": spec.ttw_factor_gco2_per_g,
            "total_wtw_gco2e_per_mj": spec.total_wtw_gco2e_per_mj,
            "default_cost_usd_per_mt": spec.default_cost_usd_per_mt,
            "carbon_content_mass_fraction": spec.carbon_content_mass_fraction,
            "regulatory_source": spec.regulatory_source,
            "description": spec.description,
            "is_cryogenic": spec.is_cryogenic,
            "requires_specialized_bunkering": spec.requires_specialized_bunkering
        })
    return fuels_data


@router.get("/corridors/list")
def list_shipping_corridors():
    """Returns all global shipping corridors with waypoints, distances, and demand."""
    corridors_data = []
    for c_id, c in GLOBAL_CORRIDORS.items():
        corridors_data.append({
            "route_id": c.route_id,
            "name": c.name,
            "origin_port": {
                "port_id": c.origin_port.port_id,
                "name": c.origin_port.name,
                "country": c.origin_port.country,
                "lat": c.origin_port.lat,
                "lon": c.origin_port.lon,
                "has_cold_ironing": c.origin_port.has_cold_ironing,
                "grid_ci": c.origin_port.grid_carbon_intensity_gco2_per_kwh
            },
            "destination_port": {
                "port_id": c.destination_port.port_id,
                "name": c.destination_port.name,
                "country": c.destination_port.country,
                "lat": c.destination_port.lat,
                "lon": c.destination_port.lon,
                "has_cold_ironing": c.destination_port.has_cold_ironing,
                "grid_ci": c.destination_port.grid_carbon_intensity_gco2_per_kwh
            },
            "distance_nm": c.distance_nm,
            "cargo_demand": c.cargo_demand_per_period,
            "max_transit_time_days": c.max_transit_time_days,
            "port_turnaround_days": c.port_turnaround_days,
            "is_eca_corridor": c.is_eca_corridor,
            "weather_severity_index": c.weather_severity_index,
            "coordinates": c.corridor_coordinates
        })
    return corridors_data


@router.get("/fleet/list")
def list_vessel_fleet():
    """Returns candidate commercial vessel fleet roster."""
    fleet_data = []
    for v in STANDARD_FLEET:
        fleet_data.append({
            "vessel_id": v.vessel_id,
            "name": v.name,
            "vessel_type": v.vessel_type.value,
            "dwt": v.dwt,
            "capacity_teu_or_dwt": v.capacity_teu_or_dwt,
            "design_speed_knots": v.design_speed_knots,
            "min_speed_knots": v.min_speed_knots,
            "max_speed_knots": v.max_speed_knots,
            "design_draft_meters": v.design_draft_meters,
            "beam_meters": v.beam_meters,
            "length_overall_meters": v.length_overall_meters,
            "main_engine_mcr_kw": v.main_engine_mcr_kw,
            "berth_aux_power_kw": v.berth_aux_power_kw,
            "compatible_fuels": [f.value for f in v.compatible_fuels],
            "has_shore_power_connection": v.has_shore_power_connection,
            "daily_capital_cost_usd": v.daily_capital_cost_usd,
            "cii_rating_baseline": v.cii_rating_baseline
        })
    return fleet_data
