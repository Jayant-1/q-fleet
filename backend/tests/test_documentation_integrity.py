"""
Q-FLEET / SIH26138 - Automated Documentation Integrity & RTM Verification Test.
Parses docs/requirements_traceability_matrix.md and verifies that every cited:
1. Implementation module exists on disk.
2. UI component exists on disk.
3. Test function exists in backend/tests/ or frontend/tests/.
4. REST API endpoint exists in the FastAPI application routing table.
"""

import re
from pathlib import Path
import pytest
from backend.app.main import app

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
RTM_FILE = ROOT_DIR / "docs" / "requirements_traceability_matrix.md"


def test_rtm_document_exists():
    assert RTM_FILE.exists(), f"Requirements Traceability Matrix missing at {RTM_FILE}"


def parse_rtm_rows():
    """Extracts rows from the markdown table in the RTM."""
    assert RTM_FILE.exists()
    content = RTM_FILE.read_text(encoding="utf-8")
    lines = content.splitlines()

    rows = []
    in_table = False
    for line in lines:
        if line.strip().startswith("| **REQ-"):
            in_table = True
            parts = [p.strip() for p in line.strip().split("|")[1:-1]]
            if len(parts) >= 9:
                req_id = parts[0]
                category = parts[1]
                statement = parts[2]
                impl_modules = [m.strip(" `") for m in parts[3].split(",") if m.strip(" `")]
                api_endpoints = [e.strip(" `") for e in parts[4].split(",") if e.strip(" `") and e.strip(" `") != "N/A"]
                ui_components = [c.strip(" `") for c in parts[5].split(",") if c.strip(" `") and c.strip(" `") != "N/A"]
                test_funcs = [t.strip(" `") for t in parts[6].split(",") if t.strip(" `") and t.strip(" `") != "N/A"]
                evidential_source = parts[7]
                status = parts[8]

                rows.append({
                    "req_id": req_id,
                    "category": category,
                    "statement": statement,
                    "impl_modules": impl_modules,
                    "api_endpoints": api_endpoints,
                    "ui_components": ui_components,
                    "test_funcs": test_funcs,
                    "evidential_source": evidential_source,
                    "status": status,
                })
    return rows


def test_rtm_implementation_modules_exist():
    rows = parse_rtm_rows()
    assert len(rows) > 0, "No requirement rows found in RTM table"

    missing = []
    for r in rows:
        for mod in r["impl_modules"]:
            file_path = ROOT_DIR / mod
            if not file_path.exists():
                missing.append(f"{r['req_id']}: missing module '{mod}' at {file_path}")

    assert not missing, "RTM references nonexistent implementation modules:\n" + "\n".join(missing)


def test_rtm_ui_components_exist():
    rows = parse_rtm_rows()
    missing = []
    for r in rows:
        for comp in r["ui_components"]:
            if comp.startswith("Full Application"):
                continue
            file_path = ROOT_DIR / comp
            if not file_path.exists():
                missing.append(f"{r['req_id']}: missing UI component '{comp}' at {file_path}")

    assert not missing, "RTM references nonexistent UI components:\n" + "\n".join(missing)


def test_rtm_test_functions_exist():
    rows = parse_rtm_rows()

    # Collect all python test function names across backend/tests
    backend_test_dir = ROOT_DIR / "backend" / "tests"
    defined_test_functions = set()
    for py_file in backend_test_dir.glob("*.py"):
        content = py_file.read_text(encoding="utf-8")
        matches = re.findall(r"^def\s+(test_[a-zA-Z0-9_]+)\s*\(", content, re.MULTILINE)
        defined_test_functions.update(matches)

    missing = []
    for r in rows:
        for tf in r["test_funcs"]:
            # If it's a test file path (e.g. frontend/tests/e2e/...)
            if "/" in tf:
                file_path = ROOT_DIR / tf
                if not file_path.exists():
                    missing.append(f"{r['req_id']}: missing test file '{tf}'")
            else:
                # Must be a test function in backend/tests
                if tf not in defined_test_functions:
                    missing.append(f"{r['req_id']}: test function '{tf}' not found in backend/tests/*.py")

    assert not missing, "RTM references nonexistent test functions:\n" + "\n".join(missing)


def test_rtm_api_endpoints_exist_in_fastapi():
    rows = parse_rtm_rows()

    # Collect all registered route paths and methods in FastAPI app using OpenAPI spec
    openapi = app.openapi()
    app_routes = set()
    for path, path_item in openapi.get("paths", {}).items():
        clean_path = re.sub(r"\{[a-zA-Z0-9_]+\}", "{id}", path)
        for method in path_item.keys():
            app_routes.add(f"{method.upper()} {clean_path}")

    missing = []
    for r in rows:
        for ep in r["api_endpoints"]:
            # Normalize RTM endpoint format: e.g. GET /api/reports/html/{id}
            norm_ep = re.sub(r"\{[a-zA-Z0-9_]+\}", "{id}", ep)
            if norm_ep.endswith("/*"):
                prefix = norm_ep[:-2]
                matched = any(r.startswith(prefix) for r in app_routes)
            else:
                matched = norm_ep in app_routes

            if not matched:
                missing.append(f"{r['req_id']}: API endpoint '{ep}' (normalized: '{norm_ep}') not found in FastAPI app routes")

    assert not missing, "RTM references nonexistent API endpoints:\n" + "\n".join(missing)
