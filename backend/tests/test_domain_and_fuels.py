"""Unit tests for domain models, fuel registry, and environmental factors."""

import pytest
from backend.app.domain.fuels import FuelType, FUEL_REGISTRY
from backend.app.domain.models import GLOBAL_CORRIDORS, GLOBAL_PORTS, STANDARD_FLEET


def test_fuel_registry_completeness():
    """Verifies all mandatory alternative fuels and shore power are registered."""
    expected_fuels = [
        FuelType.VLSFO,
        FuelType.MGO,
        FuelType.LNG,
        FuelType.BIO_METHANOL,
        FuelType.GREEN_H2,
        FuelType.GREEN_NH3,
        FuelType.SHORE_POWER
    ]
    for fuel in expected_fuels:
        assert fuel in FUEL_REGISTRY
        spec = FUEL_REGISTRY[fuel]
        assert spec.lhv_mj_per_kg > 0
        assert spec.total_wtw_gco2e_per_mj > 0
        assert spec.default_cost_usd_per_mt > 0


def test_fuel_lifecycle_consistency():
    """Verifies Well-to-Wake accounting across fossil, synthetic, and renewable pathways."""
    for code, spec in FUEL_REGISTRY.items():
        if code == FuelType.SHORE_POWER:
            continue
        if code in [FuelType.VLSFO, FuelType.MGO, FuelType.LNG]:
            # Direct combustion addition for fossil pathways
            ttw_gco2e_per_mj = (spec.ttw_factor_gco2_per_g * 1000.0) / spec.lhv_mj_per_kg
            calc_wtw = spec.wtt_factor_gco2e_per_mj + ttw_gco2e_per_mj
            assert abs(calc_wtw - spec.total_wtw_gco2e_per_mj) < 15.0
        elif code in [FuelType.BIO_METHANOL, FuelType.GREEN_H2, FuelType.GREEN_NH3]:
            # Under FuelEU Maritime and RED II, green e-fuels have biogenic credits or zero carbon TTW
            assert spec.total_wtw_gco2e_per_mj < 35.0  # Must be radically lower than fossil baseline (90.3 g/MJ)


def test_corridor_and_fleet_inventory():
    """Verifies global corridors, Indian maritime arteries, and standard fleet consistency."""
    assert len(GLOBAL_CORRIDORS) == 7
    assert len(STANDARD_FLEET) == 15
    assert "ROUTE_INDIA_EUR" in GLOBAL_CORRIDORS
    assert "ROUTE_INDIA_SGP" in GLOBAL_CORRIDORS
    assert "INNSA" in GLOBAL_PORTS
    assert "INMUN" in GLOBAL_PORTS
    assert "INMAA" in GLOBAL_PORTS

    for c in GLOBAL_CORRIDORS.values():
        assert c.distance_nm > 500.0
        assert c.cargo_demand_per_period > 0
        assert c.max_transit_time_days > 2.0

    for v in STANDARD_FLEET:
        assert v.max_speed_knots > v.min_speed_knots
        assert len(v.compatible_fuels) >= 1
        assert v.capacity_teu_or_dwt > 1000
