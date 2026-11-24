"""HTTP routes for risk evaluation and demonstration data."""

from collections import Counter
from typing import Any

from fastapi import APIRouter

from app.config import get_settings
from app.demo_data import build_demo_feature_collection
from app.models import BatchRiskRequest, BatchSummary, RiskLevel, RiskRequest, RiskResponse
from app.risk_engine import evaluate_risk

router = APIRouter(prefix="/api/v1")


@router.post("/risk/evaluate", response_model=RiskResponse, tags=["Risk"])
def evaluate(payload: RiskRequest) -> RiskResponse:
    """Evaluate one territorial risk scenario."""

    return evaluate_risk(payload, get_settings().risk_weights)


@router.post("/risk/batch", response_model=BatchSummary, tags=["Risk"])
def evaluate_batch(payload: BatchRiskRequest) -> BatchSummary:
    """Evaluate and summarize up to 1,000 scenarios."""

    results = [evaluate_risk(item, get_settings().risk_weights) for item in payload.scenarios]
    scores = [item.risk_score for item in results]
    counts = Counter(item.risk_level for item in results)
    return BatchSummary(
        count=len(results),
        mean_risk=round(sum(scores) / len(scores), 6),
        maximum_risk=max(scores),
        by_level={level: counts.get(level, 0) for level in RiskLevel},
        results=results,
    )


@router.get("/demo/risks.geojson", tags=["GeoJSON"])
def demo_risks() -> dict[str, Any]:
    """Return deterministic synthetic risk features for the web map."""

    return build_demo_feature_collection()


@router.get("/catalog", tags=["Metadata"])
def catalog() -> dict[str, Any]:
    """Describe supported hazards, dimensions and interoperability formats."""

    return {
        "hazards": ["flood", "landslide", "earthquake", "wildfire"],
        "vulnerability_dimensions": list(get_settings().risk_weights),
        "formats": ["GeoJSON", "JSON", "PostGIS"],
        "crs": ["EPSG:4326", "EPSG:32718"],
        "method_version": "1.0.0",
    }
