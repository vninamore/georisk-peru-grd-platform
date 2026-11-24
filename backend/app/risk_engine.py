"""Pure domain logic for transparent, reproducible risk scoring."""

from collections.abc import Mapping

from app.models import RiskLevel, RiskRequest, RiskResponse

DEFAULT_WEIGHTS: dict[str, float] = {
    "physical": 0.35,
    "social": 0.30,
    "economic": 0.20,
    "environmental": 0.15,
}

THRESHOLDS: tuple[tuple[float, RiskLevel], ...] = (
    (0.15, RiskLevel.LOW),
    (0.30, RiskLevel.MEDIUM),
    (0.50, RiskLevel.HIGH),
    (1.00, RiskLevel.VERY_HIGH),
)


def validate_weights(weights: Mapping[str, float]) -> None:
    """Ensure weights cover all dimensions and sum to one."""

    if set(weights) != set(DEFAULT_WEIGHTS):
        raise ValueError(f"weights must contain: {sorted(DEFAULT_WEIGHTS)}")
    if any(value < 0 for value in weights.values()):
        raise ValueError("weights cannot be negative")
    if abs(sum(weights.values()) - 1.0) > 1e-9:
        raise ValueError("weights must sum to 1.0")


def classify_risk(score: float) -> RiskLevel:
    """Map a normalized score to an ordinal risk level."""

    bounded = min(max(score, 0.0), 1.0)
    for upper_bound, level in THRESHOLDS:
        if bounded <= upper_bound:
            return level
    return RiskLevel.VERY_HIGH


def weighted_vulnerability(request: RiskRequest, weights: Mapping[str, float]) -> float:
    """Aggregate multidimensional vulnerability with explicit weights."""

    validate_weights(weights)
    values: dict[str, float] = {
        "physical": request.vulnerability.physical,
        "social": request.vulnerability.social,
        "economic": request.vulnerability.economic,
        "environmental": request.vulnerability.environmental,
    }
    return sum(values[name] * weights[name] for name in weights)


def evaluate_risk(
    request: RiskRequest,
    weights: Mapping[str, float] | None = None,
) -> RiskResponse:
    """Evaluate one risk scenario.

    The raw score is the product of normalized hazard, exposure and weighted
    vulnerability. Confidence produces a conservative adjusted score while the
    raw value remains available for auditability.
    """

    selected_weights = weights or DEFAULT_WEIGHTS
    vulnerability_index = weighted_vulnerability(request, selected_weights)
    risk_score = request.hazard * request.exposure * vulnerability_index
    adjusted = risk_score * request.confidence

    return RiskResponse(
        unit_id=request.unit_id,
        hazard_type=request.hazard_type,
        hazard_index=round(request.hazard, 6),
        exposure_index=round(request.exposure, 6),
        vulnerability_index=round(vulnerability_index, 6),
        risk_score=round(risk_score, 6),
        adjusted_risk_score=round(adjusted, 6),
        risk_level=classify_risk(risk_score),
        confidence=round(request.confidence, 6),
    )
