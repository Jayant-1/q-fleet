"""
Unit tests for IMO Carbon Intensity Indicator (CII), FuelEU Maritime, and EU ETS regulations.
"""

import pytest
from backend.app.domain.regulations import (
    compute_vessel_cii,
    compute_fueleu_maritime,
    compute_eu_ets_cost,
    CIIRating
)


def test_cii_calculation_monotonicity_and_ratings():
    """Verifies IMO MEPC.354(78) CII rating boundaries and letter grade classification."""
    # Ultra-large container ship (200,000 DWT)
    # Case 1: Extremely low fuel (Super slow steaming or bio-methanol) -> Rating A
    res_a = compute_vessel_cii(
        ship_type_category="Container",
        capacity_dwt=200000.0,
        distance_travelled_nm=10000.0,
        total_fuel_mt=300.0,  # very low fuel consumption
        fuel_cf=3.151,
        year=2026
    )
    assert res_a.rating in [CIIRating.A, CIIRating.B]
    assert res_a.is_compliant is True
    assert res_a.attained_aer_gco2_per_dwt_nm < res_a.required_cii_gco2_per_dwt_nm

    # Case 2: Excessive fuel (Speeding) -> Rating E
    res_e = compute_vessel_cii(
        ship_type_category="Container",
        capacity_dwt=200000.0,
        distance_travelled_nm=10000.0,
        total_fuel_mt=3500.0,  # massive fuel burn
        fuel_cf=3.151,
        year=2026
    )
    assert res_e.rating in [CIIRating.D, CIIRating.E]
    assert res_e.is_compliant is False


def test_fueleu_maritime_compliance_and_penalty():
    """Verifies FuelEU Maritime deficit penalty calculation under Regulation EU 2023/1805."""
    # Baseline VLSFO: WTW intensity ~ 90.3 gCO2e/MJ
    # In 2026, target is 89.34 gCO2e/MJ -> VLSFO has slight deficit
    res_vlsfo = compute_fueleu_maritime(
        energy_consumed_mj=41000.0 * 1000.0,  # 1000 MT of VLSFO
        wtw_emissions_tco2e=3702.3,           # 90.3 gCO2e/MJ
        year=2026
    )
    assert res_vlsfo.is_compliant is False
    assert res_vlsfo.compliance_balance_gco2e < 0.0
    assert res_vlsfo.penalty_eur > 0.0

    # Green Bio-Methanol: WTW intensity ~ 22.5 gCO2e/MJ -> Strong surplus, zero penalty
    res_green = compute_fueleu_maritime(
        energy_consumed_mj=19900.0 * 1000.0,
        wtw_emissions_tco2e=447.75,           # 22.5 gCO2e/MJ
        year=2026
    )
    assert res_green.is_compliant is True
    assert res_green.compliance_balance_gco2e > 0.0
    assert res_green.penalty_eur == 0.0


def test_eu_ets_cost_phase_in():
    """Verifies EU ETS 2026 100% phase-in and intra-EU vs extra-EU scope."""
    # Intra-EU (100% scope, 100% phase-in in 2026)
    res_intra = compute_eu_ets_cost(
        ttw_emissions_tco2=1000.0,
        is_intra_eu=True,
        carbon_price_eur=90.0,
        year=2026
    )
    assert res_intra.scope_pct == 100.0
    assert res_intra.surrender_emissions_tco2 == 1000.0
    assert res_intra.allowance_cost_eur == 90000.0

    # Extra-EU (50% scope)
    res_extra = compute_eu_ets_cost(
        ttw_emissions_tco2=1000.0,
        is_intra_eu=False,
        carbon_price_eur=90.0,
        year=2026
    )
    assert res_extra.scope_pct == 50.0
    assert res_extra.surrender_emissions_tco2 == 500.0
    assert res_extra.allowance_cost_eur == 45000.0
