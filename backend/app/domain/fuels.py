"""
Authoritative Marine Fuel Specifications, Lifecycle Emission Factors, and Port Shore Power.
Grounded in IMO MEPC.376(80), 2023 IMO GHG Strategy, and European Union FuelEU Maritime (Regulation EU 2023/1805).
"""

from dataclasses import dataclass
from enum import Enum
from typing import Dict, Optional


class FuelType(str, Enum):
    VLSFO = "VLSFO"                  # Very Low Sulfur Fuel Oil (Baseline)
    MGO = "MGO"                      # Marine Gas Oil
    LNG = "LNG"                      # Liquefied Natural Gas (Dual-fuel)
    BIO_METHANOL = "BIO_METHANOL"    # Green E-Methanol / Bio-Methanol (Net biogenic neutral TTW)
    GREEN_H2 = "GREEN_H2"            # Green Liquid Hydrogen (Zero TTW)
    GREEN_NH3 = "GREEN_NH3"          # Green E-Ammonia (Zero carbon TTW, slip controlled)
    SHORE_POWER = "SHORE_POWER"      # Port Berth Cold Ironing


@dataclass(frozen=True)
class FuelSpecification:
    code: FuelType
    display_name: str
    lhv_mj_per_kg: float             # Lower Heating Value (MJ / kg fuel)
    density_kg_per_m3: float         # Fuel density
    wtt_factor_gco2e_per_mj: float   # Well-to-Tank upstream emissions (g CO2e / MJ)
    ttw_factor_gco2_per_g: float     # Tank-to-Wake combustion emissions (g CO2 / g fuel)
    total_wtw_gco2e_per_mj: float    # Well-to-Wake total lifecycle carbon intensity (g CO2e / MJ)
    default_cost_usd_per_mt: float   # Benchmark bunkering cost ($ USD / metric ton)
    carbon_content_mass_fraction: float
    regulatory_source: str
    description: str
    is_cryogenic: bool = False
    requires_specialized_bunkering: bool = False


# Authoritative Fuel Registry
FUEL_REGISTRY: Dict[FuelType, FuelSpecification] = {
    FuelType.VLSFO: FuelSpecification(
        code=FuelType.VLSFO,
        display_name="Very Low Sulfur Fuel Oil (0.5% S)",
        lhv_mj_per_kg=41.0,
        density_kg_per_m3=920.0,
        wtt_factor_gco2e_per_mj=13.5,
        ttw_factor_gco2_per_g=3.151,
        total_wtw_gco2e_per_mj=90.3,
        default_cost_usd_per_mt=620.0,
        carbon_content_mass_fraction=0.86,
        regulatory_source="IMO MEPC.376(80) / ISO 8217:2017",
        description="Global maritime fleet baseline fossil fuel oil."
    ),
    FuelType.MGO: FuelSpecification(
        code=FuelType.MGO,
        display_name="Marine Gas Oil (0.1% S - ECA Compliant)",
        lhv_mj_per_kg=42.7,
        density_kg_per_m3=860.0,
        wtt_factor_gco2e_per_mj=14.2,
        ttw_factor_gco2_per_g=3.206,
        total_wtw_gco2e_per_mj=89.2,
        default_cost_usd_per_mt=780.0,
        carbon_content_mass_fraction=0.87,
        regulatory_source="IMO MEPC.376(80) / Annex VI ECA",
        description="Distillate fuel compliant with Emission Control Areas (ECA)."
    ),
    FuelType.LNG: FuelSpecification(
        code=FuelType.LNG,
        display_name="Liquefied Natural Gas (Dual-Fuel)",
        lhv_mj_per_kg=48.0,
        density_kg_per_m3=450.0,
        wtt_factor_gco2e_per_mj=18.5,
        ttw_factor_gco2_per_g=2.750,
        total_wtw_gco2e_per_mj=75.8,
        default_cost_usd_per_mt=710.0,
        carbon_content_mass_fraction=0.75,
        regulatory_source="FuelEU Maritime 2023/1805 / IMO GHG Study 4",
        description="Cryogenic methane fuel reducing SOx/PM by 99% and TTW CO2 by 21%.",
        is_cryogenic=True,
        requires_specialized_bunkering=True
    ),
    FuelType.BIO_METHANOL: FuelSpecification(
        code=FuelType.BIO_METHANOL,
        display_name="Green E-Methanol (Renewable Synthesis)",
        lhv_mj_per_kg=19.9,
        density_kg_per_m3=792.0,
        wtt_factor_gco2e_per_mj=10.2,
        ttw_factor_gco2_per_g=1.375,     # Gross TTW; net biogenic considered near-neutral under FuelEU
        total_wtw_gco2e_per_mj=22.5,
        default_cost_usd_per_mt=920.0,
        carbon_content_mass_fraction=0.375,
        regulatory_source="FuelEU Maritime Annex II / IRENA Innovation Outlook",
        description="Liquid alcohol fuel produced from green hydrogen and captured biogenic CO2.",
        requires_specialized_bunkering=True
    ),
    FuelType.GREEN_H2: FuelSpecification(
        code=FuelType.GREEN_H2,
        display_name="Green Liquid Hydrogen (Electrolysis)",
        lhv_mj_per_kg=120.0,
        density_kg_per_m3=71.0,
        wtt_factor_gco2e_per_mj=14.0,
        ttw_factor_gco2_per_g=0.000,
        total_wtw_gco2e_per_mj=14.0,
        default_cost_usd_per_mt=3400.0,
        carbon_content_mass_fraction=0.0,
        regulatory_source="IMO MEPC.376(80) / DNV Alternative Fuels",
        description="Zero-carbon fuel cell / internal combustion fuel with high specific energy.",
        is_cryogenic=True,
        requires_specialized_bunkering=True
    ),
    FuelType.GREEN_NH3: FuelSpecification(
        code=FuelType.GREEN_NH3,
        display_name="Green E-Ammonia (Renewable Haber-Bosch)",
        lhv_mj_per_kg=18.6,
        density_kg_per_m3=682.0,
        wtt_factor_gco2e_per_mj=16.5,
        ttw_factor_gco2_per_g=0.000,
        total_wtw_gco2e_per_mj=16.5,
        default_cost_usd_per_mt=1150.0,
        carbon_content_mass_fraction=0.0,
        regulatory_source="FuelEU Maritime / Ammonia Energy Association",
        description="Carbon-free zero-CO2 marine fuel synthesized from green H2 and air nitrogen.",
        is_cryogenic=True,
        requires_specialized_bunkering=True
    ),
    FuelType.SHORE_POWER: FuelSpecification(
        code=FuelType.SHORE_POWER,
        display_name="Port Shore Power (Cold Ironing)",
        lhv_mj_per_kg=3.6,              # 1 kWh = 3.6 MJ
        density_kg_per_m3=1.0,
        wtt_factor_gco2e_per_mj=31.9,    # Corresponding to ~115 gCO2/kWh clean coastal grid
        ttw_factor_gco2_per_g=0.000,     # Zero exhaust emissions at berth
        total_wtw_gco2e_per_mj=31.9,
        default_cost_usd_per_mt=50.0,    # Equivalent electrical tariff basis ($0.18/kWh)
        carbon_content_mass_fraction=0.0,
        regulatory_source="EU AFIR / IEC/IEEE 80005 High Voltage Shore Connection",
        description="Onshore electrical power supply during port cargo handling, eliminating auxiliary diesel burn."
    )
}


@dataclass
class ShorePowerProfile:
    port_id: str
    port_name: str
    has_cold_ironing: bool
    grid_carbon_intensity_gco2_per_kwh: float  # e.g., 115 g/kWh for EU green grid, 380 g/kWh for global average
    electricity_cost_usd_per_kwh: float        # e.g., $0.16 to $0.22 / kWh
    max_berth_power_mw: float                  # e.g., 5.0 MW to 16.0 MW
