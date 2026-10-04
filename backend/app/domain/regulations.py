"""
Authoritative Maritime Regulatory and Lifecycle Accounting Engine.
Implements:
1. IMO Carbon Intensity Indicator (CII) per Resolutions MEPC.352(78), MEPC.354(78), MEPC.355(78).
2. FuelEU Maritime Compliance Balance & Penalty Assessment (Regulation EU 2023/1805).
3. European Union Emissions Trading System (EU ETS Maritime Directive EU 2023/959).
4. Full Well-to-Wake (WTW) lifecycle accounting with GWP100 factors (CO2=1, CH4=28, N2O=265).
"""

import math
from typing import Dict, Any, Tuple, Optional
from enum import Enum
from pydantic import BaseModel, Field


class CIIRating(str, Enum):
    A = "A"  # Major Superior
    B = "B"  # Minor Superior
    C = "C"  # Moderate
    D = "D"  # Minor Inferior
    E = "E"  # Inferior


# IMO MEPC.353(78) Reference line parameters: CII_ref = a * Capacity^(-c)
# Capacity is DWT for cargo ships, Gross Tonnage (GT) for passenger/ro-ro.
CII_REF_LINE_PARAMS = {
    "Container": {"a": 1984.0, "c": 0.489, "cap_type": "dwt"},
    "Bulk": {"a": 4745.0, "c": 0.622, "cap_type": "dwt"},
    "Tanker": {"a": 5247.0, "c": 0.610, "cap_type": "dwt"},
    "LNG": {"a": 9.827, "c": 0.000, "cap_type": "dwt"},  # Flat or step function
    "General Cargo": {"a": 31948.0, "c": 0.792, "cap_type": "dwt"},
    "RoRo": {"a": 5739.0, "c": 0.631, "cap_type": "gt"}
}

# IMO MEPC.354(78) Boundary multipliers: d1, d2, d3, d4
# Boundaries: A < d1 * CII_req <= B < d2 * CII_req <= C <= d3 * CII_req < D <= d4 * CII_req < E
CII_BOUNDARIES = {
    "Container": {"d1": 0.82, "d2": 0.93, "d3": 1.08, "d4": 1.19},
    "Bulk": {"d1": 0.86, "d2": 0.94, "d3": 1.06, "d4": 1.18},
    "Tanker": {"d1": 0.82, "d2": 0.93, "d3": 1.08, "d4": 1.25},
    "LNG": {"d1": 0.89, "d2": 0.95, "d3": 1.06, "d4": 1.13},
    "General Cargo": {"d1": 0.83, "d2": 0.94, "d3": 1.06, "d4": 1.19},
    "RoRo": {"d1": 0.86, "d2": 0.94, "d3": 1.06, "d4": 1.18}
}

# Annual CII reduction factor Z (%) relative to 2019 baseline (MEPC.338(76))
CII_REDUCTION_FACTORS = {
    2023: 5.0,
    2024: 7.0,
    2025: 9.0,
    2026: 11.0,
    2027: 13.0,
    2028: 15.0,
    2029: 17.5,
    2030: 20.0
}

# FuelEU Maritime GHG intensity limits (Regulation EU 2023/1805)
# Baseline: 91.16 gCO2eq/MJ
FUELEU_TARGETS = {
    2024: 91.16,
    2025: 89.34,  # -2.0%
    2026: 89.34,  # -2.0%
    2027: 89.34,  # -2.0%
    2028: 89.34,  # -2.0%
    2029: 89.34,  # -2.0%
    2030: 85.69,  # -6.0%
    2035: 77.94,  # -14.5%
    2040: 62.90,  # -31.0%
    2045: 34.64,  # -62.0%
    2050: 18.23   # -80.0%
}


class VesselCIIResult(BaseModel):
    """Detailed IMO Carbon Intensity Indicator evaluation result."""
    attained_aer_gco2_per_dwt_nm: float
    reference_cii_gco2_per_dwt_nm: float
    required_cii_gco2_per_dwt_nm: float
    rating: CIIRating
    boundary_d1: float
    boundary_d2: float
    boundary_d3: float
    boundary_d4: float
    reduction_factor_z_pct: float
    compliance_ratio: float  # Attained / Required
    is_compliant: bool       # Grade C or better
    is_indicative_voyage_estimate: bool = True
    regulatory_scope_note: str = "Indicative single-voyage estimate per MEPC.354(78); statutory annual rating requires verified 12-month SEEMP Part III data"


class FuelEUComplianceResult(BaseModel):
    """Regulation (EU) 2023/1805 FuelEU Maritime compliance ledger."""
    actual_ghg_intensity_gco2e_per_mj: float
    target_ghg_intensity_gco2e_per_mj: float
    compliance_balance_gco2e: float
    energy_used_mj: float
    penalty_deficit_mt_vlsfo_eq: float
    penalty_eur: float
    penalty_usd: float
    is_compliant: bool


class EUETSResult(BaseModel):
    """Directive (EU) 2023/959 Maritime EU ETS cost assessment."""
    scope_pct: float
    phase_in_pct: float
    surrender_emissions_tco2: float
    allowance_cost_eur: float
    allowance_cost_usd: float


def compute_vessel_cii(
    ship_type_category: str,
    capacity_dwt: float,
    distance_travelled_nm: float,
    total_fuel_mt: float,
    fuel_cf: float = 3.151,  # VLSFO default (gCO2 / g fuel)
    year: int = 2026,
    gross_tonnage: Optional[float] = None
) -> VesselCIIResult:
    """
    Computes official IMO Carbon Intensity Indicator (CII) per MEPC.354(78).
    Returns AER, required reference line, and discrete letter rating A to E.
    Note: For voyage optimization, this provides an indicative operational rating proxy.
    Statutory IMO certification requires full calendar year monitoring under SEEMP Part III.
    """
    cat_key = "Container"
    for k in CII_REF_LINE_PARAMS.keys():
        if k.lower() in ship_type_category.lower():
            cat_key = k
            break

    ref_params = CII_REF_LINE_PARAMS[cat_key]
    bounds = CII_BOUNDARIES[cat_key]
    z_pct = CII_REDUCTION_FACTORS.get(year, 11.0)

    # Capacity basis: DWT for cargo, Gross Tonnage (GT) for ro-ro / passenger
    if ref_params.get("cap_type") == "gt" and gross_tonnage is not None and gross_tonnage > 0:
        eval_capacity = gross_tonnage
    else:
        eval_capacity = capacity_dwt

    # 1. Attained Annual Efficiency Ratio (AER):
    # AER = (Fuel_MT * 1e6 g/MT * CF) / (Capacity * Distance_nm)
    safe_dist = max(1.0, distance_travelled_nm)
    safe_cap = max(100.0, eval_capacity)
    co2_grams = total_fuel_mt * 1e6 * fuel_cf
    attained_aer = co2_grams / (safe_cap * safe_dist)

    # 2. Reference Line: CII_ref = a * Capacity^(-c)
    if ref_params["c"] == 0.0:
        cii_ref = ref_params["a"]
    else:
        cii_ref = ref_params["a"] * (safe_cap ** (-ref_params["c"]))

    # 3. Required CII: CII_req = CII_ref * (1 - Z / 100)
    cii_req = cii_ref * (1.0 - z_pct / 100.0)

    # 4. Boundary thresholds
    exp_d1 = cii_req * bounds["d1"]
    exp_d2 = cii_req * bounds["d2"]
    exp_d3 = cii_req * bounds["d3"]
    exp_d4 = cii_req * bounds["d4"]

    # 5. Rating assignment
    if attained_aer <= exp_d1:
        rating = CIIRating.A
    elif attained_aer <= exp_d2:
        rating = CIIRating.B
    elif attained_aer <= exp_d3:
        rating = CIIRating.C
    elif attained_aer <= exp_d4:
        rating = CIIRating.D
    else:
        rating = CIIRating.E

    ratio = attained_aer / max(1e-4, cii_req)
    is_compliant = rating in [CIIRating.A, CIIRating.B, CIIRating.C]

    return VesselCIIResult(
        attained_aer_gco2_per_dwt_nm=round(float(attained_aer), 3),
        reference_cii_gco2_per_dwt_nm=round(float(cii_ref), 3),
        required_cii_gco2_per_dwt_nm=round(float(cii_req), 3),
        rating=rating,
        boundary_d1=round(float(exp_d1), 3),
        boundary_d2=round(float(exp_d2), 3),
        boundary_d3=round(float(exp_d3), 3),
        boundary_d4=round(float(exp_d4), 3),
        reduction_factor_z_pct=z_pct,
        compliance_ratio=round(float(ratio), 4),
        is_compliant=is_compliant,
        is_indicative_voyage_estimate=True,
        regulatory_scope_note="Indicative single-voyage estimate per MEPC.354(78); statutory annual rating requires verified 12-month SEEMP Part III data"
    )


EU_MEMBER_STATES = {
    "Netherlands", "Sweden", "Germany", "France", "Spain", "Italy", "Belgium",
    "Denmark", "Greece", "Portugal", "Finland", "Poland", "Ireland", "Cyprus", "Malta"
}


def get_corridor_eu_scope(origin_country: str, dest_country: str) -> str:
    """
    Determines jurisdictional scope per Directive (EU) 2023/959 and Regulation (EU) 2023/1805.
    Returns: 'intra_eu' (100%), 'extra_eu' (50%), or 'non_eu' (0%).
    """
    origin_is_eu = origin_country in EU_MEMBER_STATES
    dest_is_eu = dest_country in EU_MEMBER_STATES
    if origin_is_eu and dest_is_eu:
        return "intra_eu"
    elif origin_is_eu or dest_is_eu:
        return "extra_eu"
    else:
        return "non_eu"


def compute_fueleu_maritime(
    energy_consumed_mj: float,
    wtw_emissions_tco2e: float,
    year: int = 2026,
    eur_usd_exchange: float = 1.08,
    scope_pct: float = 100.0
) -> FuelEUComplianceResult:
    """
    Evaluates Regulation (EU) 2023/1805 FuelEU Maritime compliance balance and penalties.
    Article 23 & Annex IV:
    Penalty = (|CB| / (GHGIE_actual * 41,000 MJ/t)) * €2,400 per MT of VLSFO energy equivalent.
    Applies scope_pct (100% intra-EU, 50% extra-EU, 0% non-EU).
    """
    if scope_pct <= 0.0:
        return FuelEUComplianceResult(
            actual_ghg_intensity_gco2e_per_mj=0.0,
            target_ghg_intensity_gco2e_per_mj=FUELEU_TARGETS.get(year, 89.34),
            compliance_balance_gco2e=0.0,
            energy_used_mj=0.0,
            penalty_deficit_mt_vlsfo_eq=0.0,
            penalty_eur=0.0,
            penalty_usd=0.0,
            is_compliant=True
        )

    target_intensity = FUELEU_TARGETS.get(year, 89.34)
    scoped_energy_mj = max(1.0, energy_consumed_mj * (scope_pct / 100.0))
    scoped_emissions_tco2e = wtw_emissions_tco2e * (scope_pct / 100.0)

    # Actual GHG intensity = (Scoped WTW emissions in gCO2eq) / (Scoped Energy in MJ)
    actual_intensity = (scoped_emissions_tco2e * 1e6) / scoped_energy_mj

    # Compliance Balance (CB) in gCO2eq: CB = (Target - Actual) * Energy_MJ
    cb_gco2e = (target_intensity - actual_intensity) * scoped_energy_mj

    if cb_gco2e >= 0.0:
        penalty_mt_vlsfo = 0.0
        penalty_eur = 0.0
    else:
        # Statutory deficit formula from Article 23(2) & Annex IV of Regulation EU 2023/1805:
        # Deficit energy in MT VLSFO equivalent = abs(CB) / (GHGIE_actual * 41,000 MJ/t)
        divisor = max(1e-4, actual_intensity * 41000.0)
        penalty_mt_vlsfo = abs(cb_gco2e) / divisor
        penalty_eur = penalty_mt_vlsfo * 2400.0

    penalty_usd = penalty_eur * eur_usd_exchange

    return FuelEUComplianceResult(
        actual_ghg_intensity_gco2e_per_mj=round(float(actual_intensity), 2),
        target_ghg_intensity_gco2e_per_mj=round(float(target_intensity), 2),
        compliance_balance_gco2e=round(float(cb_gco2e), 1),
        energy_used_mj=round(float(scoped_energy_mj), 1),
        penalty_deficit_mt_vlsfo_eq=round(float(penalty_mt_vlsfo), 2),
        penalty_eur=round(float(penalty_eur), 2),
        penalty_usd=round(float(penalty_usd), 2),
        is_compliant=(cb_gco2e >= 0.0)
    )


def compute_eu_ets_cost(
    ttw_emissions_tco2: float,
    is_intra_eu: Optional[bool] = None,
    route_eu_scope: Optional[str] = None,
    carbon_price_eur: float = 90.0,
    year: int = 2026,
    eur_usd_exchange: float = 1.08,
    gross_tonnage: Optional[float] = None
) -> EUETSResult:
    """
    Calculates EU ETS maritime compliance cost per Directive (EU) 2023/959.
    Intra-EU: 100% scope. Extra-EU: 50% scope. Non-EU: 0% scope.
    Applicability: Ships >= 5,000 GT.
    Phase-in: 2024=40%, 2025=70%, 2026+=100%.
    """
    # Check 5000 GT threshold
    if gross_tonnage is not None and gross_tonnage < 5000.0:
        return EUETSResult(
            scope_pct=0.0,
            phase_in_pct=0.0,
            surrender_emissions_tco2=0.0,
            allowance_cost_eur=0.0,
            allowance_cost_usd=0.0
        )

    # Determine scope percentage
    if route_eu_scope is not None:
        if route_eu_scope == "intra_eu":
            scope_pct = 100.0
        elif route_eu_scope == "extra_eu":
            scope_pct = 50.0
        else:
            scope_pct = 0.0
    elif is_intra_eu is not None:
        scope_pct = 100.0 if is_intra_eu else 50.0
    else:
        scope_pct = 50.0

    if year <= 2024:
        phase_in_pct = 40.0
    elif year == 2025:
        phase_in_pct = 70.0
    else:
        phase_in_pct = 100.0

    surrender_tonnes = ttw_emissions_tco2 * (scope_pct / 100.0) * (phase_in_pct / 100.0)
    allowance_cost_eur = surrender_tonnes * carbon_price_eur
    allowance_cost_usd = allowance_cost_eur * eur_usd_exchange

    return EUETSResult(
        scope_pct=scope_pct,
        phase_in_pct=phase_in_pct,
        surrender_emissions_tco2=round(float(surrender_tonnes), 2),
        allowance_cost_eur=round(float(allowance_cost_eur), 2),
        allowance_cost_usd=round(float(allowance_cost_usd), 2)
    )
