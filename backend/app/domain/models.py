"""
Maritime Fleet Domain Models: Vessels, Routes, Ports, Operational States, and Deployment Decisions.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional
from backend.app.domain.fuels import FuelType


class VesselType(str, Enum):
    CONTAINER_FEEDER = "Container_Feeder"
    CONTAINER_POSTPANAMAX = "Container_PostPanamax"
    CONTAINER_ULTRALARGE = "Container_UltraLarge"
    BULK_CAPESIZE = "BulkCarrier_Capesize"
    TANKER_VLCC = "Tanker_VLCC"


@dataclass
class VesselSpecification:
    vessel_id: str
    name: str
    vessel_type: VesselType
    dwt: float                             # Deadweight tonnage (metric tons)
    capacity_teu_or_dwt: float             # Payload capacity (TEU or DWT MT)
    design_speed_knots: float              # Design service speed (knots)
    min_speed_knots: float                 # Minimum safe navigable speed (knots)
    max_speed_knots: float                 # Maximum engine speed (knots)
    design_draft_meters: float             # Summer full load draft (m)
    beam_meters: float                     # Vessel breadth / width (m)
    length_overall_meters: float           # Length overall (LOA, m)
    main_engine_mcr_kw: float              # Maximum Continuous Rating (kW)
    auxiliary_power_kw: float              # Auxiliary hotel & cargo cooling load (kW)
    berth_aux_power_kw: float              # At-berth electrical load (kW)
    compatible_fuels: List[FuelType]       # Compatible engine fuel pathways
    has_shore_power_connection: bool       # High-voltage cold-ironing fitted
    daily_capital_cost_usd: float          # Time-charter equivalent / daily amortized fixed cost ($/day)
    cii_rating_baseline: str = "C"         # Baseline IMO Carbon Intensity Indicator rating
    gross_tonnage: Optional[float] = None  # Vessel Gross Tonnage (GT) for EU ETS eligibility threshold (>= 5,000 GT)


@dataclass
class Port:
    port_id: str
    name: str
    country: str
    lat: float
    lon: float
    has_cold_ironing: bool
    grid_carbon_intensity_gco2_per_kwh: float
    electricity_cost_usd_per_kwh: float
    is_eca: bool = False                   # Inside Emission Control Area (0.1% sulfur cap)


@dataclass
class Corridor:
    route_id: str
    name: str
    origin_port: Port
    destination_port: Port
    distance_nm: float                     # Distance in nautical miles
    cargo_demand_per_period: float         # Required throughput demand (TEU or DWT)
    max_transit_time_days: float           # Service commitment deadline (days)
    port_turnaround_days: float            # Combined dwell time at origin and destination
    is_eca_corridor: bool = False          # Subject to strict regional emission limits
    weather_severity_index: float = 1.0    # 1.0 = average calm; 1.3 = rough sea state
    corridor_coordinates: List[List[float]] = field(default_factory=list)  # [[lon, lat], ...]


@dataclass
class VesselDeploymentAllocation:
    vessel_id: str
    vessel_name: str
    vessel_type: str
    route_id: str
    route_name: str
    speed_knots: float
    fuel_type: FuelType
    shore_power_used: bool
    round_trips: int
    fuel_consumed_sea_mt: float
    fuel_consumed_berth_mt: float
    total_fuel_mt: float
    operational_cost_usd: float
    lifecycle_ghg_tco2e: float
    transit_time_days: float
    cargo_carried: float
    is_feasible: bool
    violation_reasons: List[str] = field(default_factory=list)
    cii_rating: str = "C"
    attained_aer: float = 0.0
    fueleu_deficit_penalty_usd: float = 0.0
    eu_ets_cost_usd: float = 0.0
    target_speed_knots: Optional[float] = None
    applied_speed_knots: float = 0.0
    speed_adjustment_reason: str = ""
    fuel_adjustment_reason: str = ""
    applied_draft_meters: float = 0.0


@dataclass
class FleetDeploymentSolution:
    solution_id: str
    algorithm: str
    total_fuel_mt: float
    total_cost_usd: float
    total_lifecycle_ghg_tco2e: float
    total_cargo_delivered: float
    demand_satisfaction_pct: float
    schedule_reliability_pct: float
    is_feasible: bool
    allocations: List[VesselDeploymentAllocation]
    pareto_rank: int = 1
    crowding_distance: float = 0.0
    fleet_average_cii_rating: str = "C"
    total_fueleu_penalty_usd: float = 0.0
    total_eu_ets_cost_usd: float = 0.0
    cii_grade_counts: Dict[str, int] = field(default_factory=dict)


# Standardized Ports
GLOBAL_PORTS: Dict[str, Port] = {
    "CNSHA": Port("CNSHA", "Port of Shanghai", "China", 31.2304, 121.4737, has_cold_ironing=True, grid_carbon_intensity_gco2_per_kwh=530.0, electricity_cost_usd_per_kwh=0.14, is_eca=False),
    "NLRTM": Port("NLRTM", "Port of Rotterdam", "Netherlands", 51.9244, 4.4777, has_cold_ironing=True, grid_carbon_intensity_gco2_per_kwh=160.0, electricity_cost_usd_per_kwh=0.20, is_eca=True),
    "USLAX": Port("USLAX", "Port of Los Angeles", "USA", 33.7432, -118.2673, has_cold_ironing=True, grid_carbon_intensity_gco2_per_kwh=190.0, electricity_cost_usd_per_kwh=0.22, is_eca=True),
    "SEGOT": Port("SEGOT", "Port of Gothenburg", "Sweden", 57.7089, 11.9746, has_cold_ironing=True, grid_carbon_intensity_gco2_per_kwh=45.0, electricity_cost_usd_per_kwh=0.18, is_eca=True),
    "USNYC": Port("USNYC", "Port of New York & New Jersey", "USA", 40.7128, -74.0060, has_cold_ironing=True, grid_carbon_intensity_gco2_per_kwh=220.0, electricity_cost_usd_per_kwh=0.21, is_eca=True),
    "SGSIN": Port("SGSIN", "Port of Singapore", "Singapore", 1.3521, 103.8198, has_cold_ironing=False, grid_carbon_intensity_gco2_per_kwh=390.0, electricity_cost_usd_per_kwh=0.17, is_eca=False),
    "INNSA": Port("INNSA", "Jawaharlal Nehru Port (JNPA Mumbai)", "India", 18.9496, 72.9515, has_cold_ironing=False, grid_carbon_intensity_gco2_per_kwh=620.0, electricity_cost_usd_per_kwh=0.13, is_eca=False),
    "INMUN": Port("INMUN", "Port of Mundra (Deendayal)", "India", 22.84, 69.70, has_cold_ironing=False, grid_carbon_intensity_gco2_per_kwh=640.0, electricity_cost_usd_per_kwh=0.13, is_eca=False),
    "INMAA": Port("INMAA", "Chennai Port", "India", 13.08, 80.30, has_cold_ironing=False, grid_carbon_intensity_gco2_per_kwh=610.0, electricity_cost_usd_per_kwh=0.13, is_eca=False),
}

# Standardized Shipping Corridors
GLOBAL_CORRIDORS: Dict[str, Corridor] = {
    "ROUTE_ASIA_EUR": Corridor(
        route_id="ROUTE_ASIA_EUR",
        name="Asia - Europe Maritime Silk Expressway",
        origin_port=GLOBAL_PORTS["CNSHA"],
        destination_port=GLOBAL_PORTS["NLRTM"],
        distance_nm=10500.0,
        cargo_demand_per_period=28000.0,  # TEU
        max_transit_time_days=28.5,
        port_turnaround_days=2.5,
        is_eca_corridor=False,
        weather_severity_index=1.05,
        corridor_coordinates=[
            [121.47, 31.23], [115.0, 15.0], [103.82, 1.35], [80.0, 6.0], 
            [50.0, 12.0], [32.5, 30.0], [15.0, 36.0], [-5.5, 36.0], [-9.5, 38.7], [4.48, 51.92]
        ]
    ),
    "ROUTE_TRANSPAC": Corridor(
        route_id="ROUTE_TRANSPAC",
        name="Transpacific Golden Corridor",
        origin_port=GLOBAL_PORTS["CNSHA"],
        destination_port=GLOBAL_PORTS["USLAX"],
        distance_nm=6500.0,
        cargo_demand_per_period=22000.0,  # TEU
        max_transit_time_days=17.5,
        port_turnaround_days=2.0,
        is_eca_corridor=False,
        weather_severity_index=1.15,
        corridor_coordinates=[
            [121.47, 31.23], [140.0, 35.0], [170.0, 42.0], [-160.0, 40.0], [-130.0, 35.0], [-118.27, 33.74]
        ]
    ),
    "ROUTE_INTRA_EUR": Corridor(
        route_id="ROUTE_INTRA_EUR",
        name="North Sea / Baltic ECA Feeder",
        origin_port=GLOBAL_PORTS["NLRTM"],
        destination_port=GLOBAL_PORTS["SEGOT"],
        distance_nm=750.0,
        cargo_demand_per_period=3500.0,   # TEU
        max_transit_time_days=3.5,
        port_turnaround_days=0.8,
        is_eca_corridor=True,             # Sulfur ≤ 0.1% mandatory
        weather_severity_index=1.20,
        corridor_coordinates=[
            [4.48, 51.92], [6.0, 54.0], [8.0, 57.0], [11.97, 57.71]
        ]
    ),
    "ROUTE_TRANSATL": Corridor(
        route_id="ROUTE_TRANSATL",
        name="Transatlantic Northern Liner",
        origin_port=GLOBAL_PORTS["NLRTM"],
        destination_port=GLOBAL_PORTS["USNYC"],
        distance_nm=3400.0,
        cargo_demand_per_period=12000.0,  # TEU
        max_transit_time_days=11.0,
        port_turnaround_days=1.5,
        is_eca_corridor=False,
        weather_severity_index=1.25,
        corridor_coordinates=[
            [4.48, 51.92], [-5.0, 50.0], [-25.0, 48.0], [-50.0, 44.0], [-74.0, 40.71]
        ]
    ),
    "ROUTE_IND_OCEAN": Corridor(
        route_id="ROUTE_IND_OCEAN",
        name="Indian Ocean Commercial Artery",
        origin_port=GLOBAL_PORTS["SGSIN"],
        destination_port=GLOBAL_PORTS["INNSA"],
        distance_nm=2450.0,
        cargo_demand_per_period=9500.0,   # TEU
        max_transit_time_days=9.5,
        port_turnaround_days=1.5,
        is_eca_corridor=False,
        weather_severity_index=1.10,
        corridor_coordinates=[
            [103.82, 1.35], [95.0, 5.0], [82.0, 6.0], [75.0, 10.0], [72.95, 18.95]
        ]
    ),
    "ROUTE_INDIA_EUR": Corridor(
        route_id="ROUTE_INDIA_EUR",
        name="India-Europe Green Freight Corridor (JNPA - Rotterdam)",
        origin_port=GLOBAL_PORTS["INNSA"],
        destination_port=GLOBAL_PORTS["NLRTM"],
        distance_nm=6350.0,
        cargo_demand_per_period=18000.0,   # TEU
        max_transit_time_days=21.0,
        port_turnaround_days=2.0,
        is_eca_corridor=False,
        weather_severity_index=1.08,
        corridor_coordinates=[
            [72.95, 18.95], [60.0, 15.0], [45.0, 12.5], [38.0, 20.0], [32.5, 30.0], [20.0, 35.0], [-5.5, 36.0], [-9.5, 38.7], [4.48, 51.92]
        ]
    ),
    "ROUTE_INDIA_SGP": Corridor(
        route_id="ROUTE_INDIA_SGP",
        name="India-Singapore Trade Arterial (JNPA - Singapore)",
        origin_port=GLOBAL_PORTS["INNSA"],
        destination_port=GLOBAL_PORTS["SGSIN"],
        distance_nm=2450.0,
        cargo_demand_per_period=10000.0,  # TEU
        max_transit_time_days=9.0,
        port_turnaround_days=1.5,
        is_eca_corridor=False,
        weather_severity_index=1.10,
        corridor_coordinates=[
            [72.95, 18.95], [75.0, 10.0], [82.0, 6.0], [95.0, 5.0], [103.82, 1.35]
        ]
    )
}

# Standard Commercial Fleet Roster (15 Vessel Candidates)
STANDARD_FLEET: List[VesselSpecification] = [
    VesselSpecification("VESSEL_01", "Oceanic Apex", VesselType.CONTAINER_ULTRALARGE, 195000, 21000, 19.5, 12.0, 22.5, 16.0, 61.4, 399.9, 68000, 4500, 1800, [FuelType.VLSFO, FuelType.MGO, FuelType.LNG], True, 48000.0, "B", 210000.0),
    VesselSpecification("VESSEL_02", "Titan Horizon", VesselType.CONTAINER_ULTRALARGE, 190000, 20500, 19.0, 12.0, 22.0, 15.8, 60.0, 398.0, 65000, 4400, 1750, [FuelType.VLSFO, FuelType.MGO, FuelType.BIO_METHANOL], True, 49500.0, "A", 205000.0),
    VesselSpecification("VESSEL_03", "Starlight Voyager", VesselType.CONTAINER_ULTRALARGE, 185000, 19800, 18.5, 12.0, 21.5, 15.5, 59.0, 395.0, 62000, 4200, 1700, [FuelType.VLSFO, FuelType.MGO], False, 42000.0, "D", 198000.0),
    
    VesselSpecification("VESSEL_04", "Pacific Pioneer", VesselType.CONTAINER_POSTPANAMAX, 95000, 8800, 18.0, 11.0, 21.0, 14.0, 42.8, 300.0, 36000, 2800, 1100, [FuelType.VLSFO, FuelType.MGO, FuelType.LNG], True, 28000.0, "B", 94000.0),
    VesselSpecification("VESSEL_05", "Emerald Wave", VesselType.CONTAINER_POSTPANAMAX, 92000, 8500, 18.0, 11.0, 21.0, 13.8, 42.8, 298.0, 35000, 2700, 1050, [FuelType.VLSFO, FuelType.MGO, FuelType.BIO_METHANOL], True, 29500.0, "A", 91000.0),
    VesselSpecification("VESSEL_06", "Northern Breeze", VesselType.CONTAINER_POSTPANAMAX, 90000, 8200, 17.5, 11.0, 20.5, 13.5, 42.0, 294.0, 34000, 2600, 1000, [FuelType.VLSFO, FuelType.MGO, FuelType.GREEN_NH3], True, 31000.0, "A", 89000.0),
    VesselSpecification("VESSEL_07", "Azure Sentinel", VesselType.CONTAINER_POSTPANAMAX, 88000, 8000, 17.0, 11.0, 20.0, 13.2, 41.5, 290.0, 32000, 2500, 950, [FuelType.VLSFO, FuelType.MGO], False, 24000.0, "C", 87000.0),

    VesselSpecification("VESSEL_08", "Baltic Runner", VesselType.CONTAINER_FEEDER, 18500, 1500, 16.0, 10.0, 18.5, 9.2, 23.5, 158.0, 11500, 1200, 450, [FuelType.MGO, FuelType.BIO_METHANOL], True, 11000.0, "A", 17800.0),
    VesselSpecification("VESSEL_09", "Nordic Swift", VesselType.CONTAINER_FEEDER, 17000, 1350, 15.5, 10.0, 18.0, 8.8, 22.8, 152.0, 10500, 1100, 400, [FuelType.MGO, FuelType.GREEN_H2], True, 13500.0, "A", 16500.0),
    VesselSpecification("VESSEL_10", "Fjord Express", VesselType.CONTAINER_FEEDER, 16500, 1300, 15.0, 10.0, 17.5, 8.5, 22.0, 148.0, 9800, 1000, 380, [FuelType.VLSFO, FuelType.MGO], False, 9200.0, "C", 15900.0),

    VesselSpecification("VESSEL_11", "Cape Endurance", VesselType.BULK_CAPESIZE, 180000, 175000, 14.5, 9.5, 16.5, 18.2, 45.0, 292.0, 18500, 1500, 500, [FuelType.VLSFO, FuelType.MGO, FuelType.LNG], True, 27000.0, "B", 93000.0),
    VesselSpecification("VESSEL_12", "Iron Navigator", VesselType.BULK_CAPESIZE, 175000, 170000, 14.0, 9.5, 16.0, 18.0, 45.0, 289.0, 17800, 1450, 480, [FuelType.VLSFO, FuelType.MGO, FuelType.GREEN_NH3], True, 29000.0, "A", 91000.0),
    VesselSpecification("VESSEL_13", "Mineral Titan", VesselType.BULK_CAPESIZE, 172000, 168000, 13.8, 9.5, 15.8, 17.8, 44.5, 287.0, 17000, 1400, 450, [FuelType.VLSFO, FuelType.MGO], False, 22500.0, "C", 89500.0),

    VesselSpecification("VESSEL_14", "Polaris Sovereign", VesselType.TANKER_VLCC, 305000, 295000, 15.0, 10.0, 16.8, 22.0, 60.0, 333.0, 28000, 2200, 850, [FuelType.VLSFO, FuelType.MGO, FuelType.LNG], True, 44000.0, "B", 160000.0),
    VesselSpecification("VESSEL_15", "Solaris Trader", VesselType.TANKER_VLCC, 298000, 288000, 14.5, 10.0, 16.2, 21.5, 60.0, 330.0, 26500, 2100, 800, [FuelType.VLSFO, FuelType.MGO, FuelType.BIO_METHANOL], True, 46000.0, "A", 157000.0),
]
