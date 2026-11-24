"""Deterministic synthetic scenarios used by the portfolio dashboard."""

from typing import Any

from app.models import RiskRequest
from app.risk_engine import evaluate_risk

_DEMO_UNITS: tuple[dict[str, Any], ...] = (
    {
        "unit_id": "LIM-DEMO-001",
        "name": "Sector Ribereño Norte",
        "coordinates": [-76.945, -12.025],
        "hazard_type": "flood",
        "hazard": 0.88,
        "exposure": 0.84,
        "vulnerability": {
            "physical": 0.82,
            "social": 0.70,
            "economic": 0.62,
            "environmental": 0.55,
        },
    },
    {
        "unit_id": "LIM-DEMO-002",
        "name": "Ladera Este",
        "coordinates": [-76.905, -12.075],
        "hazard_type": "landslide",
        "hazard": 0.78,
        "exposure": 0.65,
        "vulnerability": {
            "physical": 0.76,
            "social": 0.66,
            "economic": 0.58,
            "environmental": 0.71,
        },
    },
    {
        "unit_id": "LIM-DEMO-003",
        "name": "Centro Urbano",
        "coordinates": [-77.035, -12.055],
        "hazard_type": "earthquake",
        "hazard": 0.67,
        "exposure": 0.92,
        "vulnerability": {
            "physical": 0.60,
            "social": 0.48,
            "economic": 0.45,
            "environmental": 0.30,
        },
    },
    {
        "unit_id": "LIM-DEMO-004",
        "name": "Interfaz Urbano-Forestal",
        "coordinates": [-76.870, -12.110],
        "hazard_type": "wildfire",
        "hazard": 0.51,
        "exposure": 0.38,
        "vulnerability": {
            "physical": 0.48,
            "social": 0.40,
            "economic": 0.32,
            "environmental": 0.74,
        },
    },
    {
        "unit_id": "LIM-DEMO-005",
        "name": "Zona Consolidada Oeste",
        "coordinates": [-77.105, -12.095],
        "hazard_type": "earthquake",
        "hazard": 0.45,
        "exposure": 0.52,
        "vulnerability": {
            "physical": 0.34,
            "social": 0.29,
            "economic": 0.25,
            "environmental": 0.18,
        },
    },
)


def build_demo_feature_collection() -> dict[str, Any]:
    """Return synthetic risk points as a GeoJSON FeatureCollection."""

    features: list[dict[str, Any]] = []
    for item in _DEMO_UNITS:
        request = RiskRequest.model_validate(
            {key: value for key, value in item.items() if key not in {"name", "coordinates"}}
        )
        result = evaluate_risk(request)
        features.append(
            {
                "type": "Feature",
                "id": item["unit_id"],
                "geometry": {"type": "Point", "coordinates": item["coordinates"]},
                "properties": {"name": item["name"], **result.model_dump(mode="json")},
            }
        )
    return {
        "type": "FeatureCollection",
        "name": "synthetic_multihazard_risk",
        "metadata": {
            "crs": "EPSG:4326",
            "disclaimer": "Synthetic data for demonstration only; not official information.",
        },
        "features": features,
    }
