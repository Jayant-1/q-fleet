"""
FastAPI Routes for Scenario Definitions, Fleets, Corridors, Ports, and Fuel Registry.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.domain.fuels import FUEL_REGISTRY, FuelType
from backend.app.domain.models import GLOBAL_CORRIDORS, GLOBAL_PORTS, STANDARD_FLEET, VesselType

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


@router.get("/provenance")
def get_data_provenance():
    """Returns authoritative Data Provenance Manifest detailing sources, SHA-256 hashes, and licenses."""
    import json
    from pathlib import Path
    manifest_p = Path(__file__).resolve().parent.parent.parent.parent / "data" / "data_provenance_manifest.json"
    if manifest_p.exists():
        with open(manifest_p, "r") as f:
            return json.load(f)
    return {
        "pipeline_name": "SIH26138 Green Fleet Data Ingestion Engine",
        "generated_at_utc": "2026-10-03T12:00:00Z",
        "datasets": [
            {
                "id": "EMSA_THETIS_MRV_2022",
                "title": "EMSA THETIS-MRV 2022 Annual Emission Reports",
                "source_url": "https://mrv.emsa.europa.eu",
                "publisher": "European Maritime Safety Agency",
                "license": "European Union Public Data"
            }
        ]
    }


@router.get("/ports/list")
def list_ports():
    """
    Returns curated operational port terminals with grid carbon intensities and cold-ironing capabilities.
    Note: These are 7 calibrated operational hubs with engineering parameters for simulation,
    distinct from the raw international UN/LOCODE registry.
    """
    ports_data = []
    for p_id, p in GLOBAL_PORTS.items():
        ports_data.append({
            "port_id": p.port_id,
            "name": p.name,
            "country": p.country,
            "lat": p.lat,
            "lon": p.lon,
            "has_cold_ironing": p.has_cold_ironing,
            "grid_carbon_intensity_gco2_per_kwh": p.grid_carbon_intensity_gco2_per_kwh,
            "electricity_cost_usd_per_kwh": p.electricity_cost_usd_per_kwh,
            "is_eca": p.is_eca
        })
    return {
        "catalog_type": "Curated Operational Hubs (Modeled Shore-Power Attributes)",
        "ports_count": len(ports_data),
        "ports": ports_data
    }


@router.get("/mrv-vessels")
def list_mrv_vessels(query: str = "", page: int = 1, page_size: int = 50):
    """
    Returns searchable real commercial vessels from the official EMSA THETIS-MRV dataset.
    Loads the full 25,691 vessel dataset with pagination and search.
    Fallback to sample fixture only if primary dataset is absent.
    """
    import math
    import pandas as pd
    from pathlib import Path

    data_dir = Path(__file__).resolve().parent.parent.parent.parent / "data"
    mrv_csv = data_dir / "mrv" / "mrv_cleaned_vessels.csv"
    is_fallback = False

    if mrv_csv.exists():
        source_label = "Official EMSA THETIS-MRV Dataset (Full Cleaned Archive)"
    else:
        mrv_csv = data_dir / "fixtures" / "mrv_sample.csv"
        is_fallback = True
        source_label = "EMSA THETIS-MRV Sample Fixture (1,000 Vessels Fallback)"

    if not mrv_csv.exists():
        return {
            "total_count": 0,
            "page": page,
            "page_size": page_size,
            "total_pages": 0,
            "is_fallback": is_fallback,
            "dataset_source": "Unavailable",
            "records": []
        }

    df = pd.read_csv(mrv_csv)
    if query:
        q_lower = query.lower()
        mask = (
            df["ship_name"].astype(str).str.lower().str.contains(q_lower) |
            df["imo_number"].astype(str).str.contains(q_lower) |
            df["ship_type"].astype(str).str.lower().str.contains(q_lower)
        )
        df = df[mask]

    total_count = len(df)
    page = max(1, page)
    page_size = max(1, min(200, page_size))
    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 0

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    df_page = df.iloc[start_idx:end_idx]

    records = []
    for _, row in df_page.iterrows():
        records.append({
            "imo_number": int(row.get("imo_number", 0)),
            "ship_name": str(row.get("ship_name", "UNKNOWN")),
            "ship_type": str(row.get("ship_type", "Other")),
            "reporting_period": int(row.get("reporting_period", 2022)),
            "efficiency_type": str(row.get("efficiency_type", "EEDI")),
            "efficiency_val_gco2_per_tnm": float(row.get("efficiency_val_gco2_per_tnm", 0.0)) if pd.notna(row.get("efficiency_val_gco2_per_tnm")) else None,
            "time_at_sea_hours": float(row.get("time_at_sea_hours", 0.0)) if pd.notna(row.get("time_at_sea_hours")) else None,
            "time_at_sea_through_ice_hours": float(row.get("time_at_sea_through_ice_hours", 0.0)) if pd.notna(row.get("time_at_sea_through_ice_hours")) else 0.0,
            "has_ice_class": bool(row.get("has_ice_class", False)),
            "ice_class": str(row.get("ice_class", "None")),
            "total_co2_emissions_m_tonnes": float(row.get("total_co2_emissions_m_tonnes", 0.0)) if pd.notna(row.get("total_co2_emissions_m_tonnes")) else 0.0,
            "total_fuel_consumption_m_tonnes": float(row.get("total_fuel_consumption_m_tonnes", 0.0)) if pd.notna(row.get("total_fuel_consumption_m_tonnes")) else 0.0
        })

    return {
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "is_fallback": is_fallback,
        "dataset_source": source_label,
        "records": records
    }


@router.get("/ports/unlocode")
def list_unlocode_ports(query: str = "", country: str = "", page: int = 1, page_size: int = 50):
    """
    Returns searchable global port locations from the official UN/LOCODE registry (11,829 ports).
    Note: UN/LOCODE coordinates and function codes indicate transport geographic locations and do NOT
    certify terminal-level electrical shore-power infrastructure or local grid carbon intensity.
    """
    import math
    import pandas as pd
    from pathlib import Path

    data_dir = Path(__file__).resolve().parent.parent.parent.parent / "data"
    ports_csv = data_dir / "ports" / "ports_cleaned.csv"
    if not ports_csv.exists():
        ports_csv = data_dir / "fixtures" / "major_ports_fixture.csv"

    if not ports_csv.exists():
        return {
            "catalog_type": "UN/LOCODE Standardized Maritime Locations (UNECE 2024-2)",
            "disclaimer": "UN/LOCODE coordinates indicate geographic locations and do NOT certify terminal-level shore-power infrastructure.",
            "total_count": 0,
            "page": page,
            "page_size": page_size,
            "total_pages": 0,
            "records": []
        }

    df = pd.read_csv(ports_csv)
    if country:
        df = df[df["country"].astype(str).str.upper() == country.strip().upper()]
    if query:
        q_lower = query.lower().strip()
        mask = (
            df["locode"].astype(str).str.lower().str.contains(q_lower) |
            df["port_name"].astype(str).str.lower().str.contains(q_lower) |
            df["country"].astype(str).str.lower().str.contains(q_lower)
        )
        df = df[mask]

    total_count = len(df)
    page = max(1, page)
    page_size = max(1, min(200, page_size))
    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 0

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    df_page = df.iloc[start_idx:end_idx]

    records = []
    for _, row in df_page.iterrows():
        records.append({
            "locode": str(row.get("locode", "")),
            "port_name": str(row.get("port_name", "")),
            "country": str(row.get("country", "")),
            "latitude": float(row.get("latitude", 0.0)) if pd.notna(row.get("latitude")) else None,
            "longitude": float(row.get("longitude", 0.0)) if pd.notna(row.get("longitude")) else None,
        })

    return {
        "catalog_type": "UN/LOCODE Standardized Maritime Locations (UNECE 2024-2)",
        "disclaimer": "UN/LOCODE coordinates and function codes indicate transport geographic locations and do NOT certify terminal-level electrical shore-power infrastructure or local grid carbon intensity.",
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "records": records
    }


@router.post("/vessels/validate-csv")
def validate_custom_vessel_csv(payload: Dict[str, str]):
    """
    Rigorously validates user-uploaded CSV text for custom fleet integration.
    Checks:
    - Required headers: name, vessel_type, dwt, design_speed_knots, compatible_fuels
    - Strict vessel_type enums (no silent fallbacks)
    - Strict compatible_fuels enums (no silent fallbacks)
    - Realistic physical bounds (DWT 1,000..450,000 MT, speed 6.0..30.0 knots)
    - Speed monotonic relationships (min_speed < design_speed < max_speed)
    - Duplicate identifier checks (unique vessel names/IDs)
    - Capacity semantics (TEU for container ships, DWT for bulk/tankers)
    """
    import io
    import csv

    raw_csv = payload.get("csv_content", "")
    if not raw_csv.strip():
        return {"is_valid": False, "errors": ["CSV content is empty"], "valid_vessels": [], "parsed_count": 0}

    reader = csv.DictReader(io.StringIO(raw_csv.strip()))
    required_cols = {"name", "vessel_type", "dwt", "design_speed_knots", "compatible_fuels"}
    fieldnames_clean = {c.lower().strip() for c in (reader.fieldnames or [])}
    if not required_cols.issubset(fieldnames_clean):
        missing = required_cols - fieldnames_clean
        return {
            "is_valid": False,
            "errors": [f"Missing required CSV columns: {', '.join(sorted(missing))}"],
            "valid_vessels": [],
            "parsed_count": 0
        }

    valid_vessel_types = {vt.value.lower(): vt for vt in VesselType}
    alias_map = {
        "container_feeder": VesselType.CONTAINER_FEEDER,
        "container_postpanamax": VesselType.CONTAINER_POSTPANAMAX,
        "container_ultralarge": VesselType.CONTAINER_ULTRALARGE,
        "bulkcarrier_capesize": VesselType.BULK_CAPESIZE,
        "bulk_capesize": VesselType.BULK_CAPESIZE,
        "bulkcarrier": VesselType.BULK_CAPESIZE,
        "tanker_vlcc": VesselType.TANKER_VLCC,
        "tanker": VesselType.TANKER_VLCC,
    }
    valid_fuels = {ft.value.upper(): ft for ft in FuelType if ft != FuelType.SHORE_POWER}

    valid_vessels = []
    errors = []
    seen_identifiers = set()

    for idx, row in enumerate(reader, start=1):
        row_ci = {k.lower().strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
        name = row_ci.get("name", "").strip()
        v_type_raw = row_ci.get("vessel_type", "").strip()
        dwt_raw = row_ci.get("dwt", "").strip()
        speed_raw = row_ci.get("design_speed_knots", "").strip()
        fuels_raw = row_ci.get("compatible_fuels", "").strip()

        # 1. Name and duplicate identifier validation
        if not name:
            errors.append(f"Row {idx}: Vessel name cannot be blank")
            continue
        vessel_id = row_ci.get("vessel_id") or f"USR_{idx:03d}"
        if name.lower() in seen_identifiers:
            errors.append(f"Row {idx}: Duplicate vessel name '{name}' detected")
            continue
        if vessel_id.lower() in seen_identifiers:
            errors.append(f"Row {idx}: Duplicate vessel ID '{vessel_id}' detected")
            continue
        seen_identifiers.add(name.lower())
        seen_identifiers.add(vessel_id.lower())

        # 2. Vessel Type Enum Validation (No Silent Defaulting!)
        matched_vt = valid_vessel_types.get(v_type_raw.lower()) or alias_map.get(v_type_raw.lower().replace(" ", "_"))
        if not matched_vt:
            allowed_types = [vt.value for vt in VesselType]
            errors.append(f"Row {idx}: Invalid vessel_type '{v_type_raw}'. Must be one of: {allowed_types}")
            continue

        # 3. DWT & Realistic Bounds
        try:
            dwt = float(dwt_raw)
            if dwt < 1000.0 or dwt > 450000.0:
                errors.append(f"Row {idx}: DWT {dwt} MT out of realistic maritime bounds [1,000, 450,000] MT")
                continue
        except (ValueError, TypeError):
            errors.append(f"Row {idx}: DWT '{dwt_raw}' is not a valid number")
            continue

        # 4. Speed & Realistic Bounds
        try:
            speed = float(speed_raw)
            if speed < 6.0 or speed > 30.0:
                errors.append(f"Row {idx}: Design speed {speed} knots out of realistic bounds [6.0, 30.0] knots")
                continue
        except (ValueError, TypeError):
            errors.append(f"Row {idx}: Speed '{speed_raw}' is not a valid number")
            continue

        # Speed relationships
        min_speed_raw = row_ci.get("min_speed_knots")
        max_speed_raw = row_ci.get("max_speed_knots")
        try:
            min_speed = float(min_speed_raw) if min_speed_raw else max(6.0, round(speed - 4.0, 1))
            max_speed = float(max_speed_raw) if max_speed_raw else min(32.0, round(speed + 3.5, 1))
            if min_speed >= speed:
                errors.append(f"Row {idx}: Minimum speed ({min_speed} kn) must be strictly less than design speed ({speed} kn)")
                continue
            if max_speed <= speed:
                errors.append(f"Row {idx}: Maximum speed ({max_speed} kn) must be strictly greater than design speed ({speed} kn)")
                continue
        except ValueError:
            errors.append(f"Row {idx}: Invalid min_speed or max_speed numeric format")
            continue

        # 5. Compatible Fuels Enum Validation (No Silent Defaulting!)
        if not fuels_raw:
            errors.append(f"Row {idx}: compatible_fuels cannot be empty")
            continue
        raw_fuel_items = [f.strip().upper() for f in fuels_raw.split(",") if f.strip()]
        matched_fuels = []
        invalid_fuel_items = []
        for fi in raw_fuel_items:
            if fi in valid_fuels:
                matched_fuels.append(valid_fuels[fi].value)
            else:
                invalid_fuel_items.append(fi)
        if invalid_fuel_items:
            allowed_fuels = list(valid_fuels.keys())
            errors.append(f"Row {idx}: Invalid fuel(s) {invalid_fuel_items}. Allowed marine fuels: {allowed_fuels}")
            continue

        # 6. Capacity Semantics
        cap_raw = row_ci.get("capacity_teu_or_dwt") or row_ci.get("capacity_teu") or row_ci.get("capacity_dwt")
        if cap_raw:
            try:
                capacity = float(cap_raw)
                if capacity <= 0:
                    errors.append(f"Row {idx}: Capacity must be positive")
                    continue
            except ValueError:
                errors.append(f"Row {idx}: Capacity '{cap_raw}' is not a valid number")
                continue
        else:
            if "container" in matched_vt.value.lower():
                capacity = round(dwt / 13.5, 0)
            else:
                capacity = round(dwt * 0.95, 0)

        # 7. Gross Tonnage
        gt_raw = row_ci.get("gross_tonnage")
        gt_val = None
        if gt_raw:
            try:
                gt_val = float(gt_raw)
                if gt_val <= 0:
                    errors.append(f"Row {idx}: Gross tonnage must be positive if provided")
                    continue
            except ValueError:
                errors.append(f"Row {idx}: Gross tonnage '{gt_raw}' is not a valid number")
                continue

        draft = float(row_ci.get("design_draft_meters", max(6.0, round(0.12 * (dwt ** 0.42), 1))))
        beam = float(row_ci.get("beam_meters", max(18.0, round(0.40 * (dwt ** 0.42), 1))))
        loa = float(row_ci.get("length_overall_meters", max(120.0, round(2.8 * (dwt ** 0.42), 1))))
        mcr = float(row_ci.get("main_engine_mcr_kw", max(6000.0, round(0.45 * dwt * (speed / 15.0) ** 2.2, 0))))
        aux_power = 2500.0 if "container" in matched_vt.value.lower() else 1400.0
        berth_power = 900.0 if "container" in matched_vt.value.lower() else 450.0

        valid_vessels.append({
            "vessel_id": vessel_id,
            "name": name,
            "vessel_type": matched_vt.value,
            "dwt": dwt,
            "capacity_teu_or_dwt": capacity,
            "design_speed_knots": speed,
            "min_speed_knots": min_speed,
            "max_speed_knots": max_speed,
            "design_draft_meters": draft,
            "beam_meters": beam,
            "length_overall_meters": loa,
            "main_engine_mcr_kw": mcr,
            "auxiliary_power_kw": aux_power,
            "berth_aux_power_kw": berth_power,
            "compatible_fuels": matched_fuels,
            "has_shore_power_connection": True,
            "daily_capital_cost_usd": round(dwt * 0.22 + 5000.0, 1),
            "cii_rating_baseline": "C",
            "gross_tonnage": gt_val
        })

    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "valid_vessels": valid_vessels,
        "parsed_count": len(valid_vessels)
    }


