"""Dependency-light GeoJSON quality gates for ingestion pipelines."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True, slots=True)
class QualityIssue:
    code: str
    message: str
    feature_index: int | None = None
    severity: str = "error"


@dataclass(slots=True)
class QualityReport:
    feature_count: int = 0
    valid_feature_count: int = 0
    issues: list[QualityIssue] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return not any(issue.severity == "error" for issue in self.issues)

    @property
    def completeness(self) -> float:
        if self.feature_count == 0:
            return 0.0
        return round(self.valid_feature_count / self.feature_count, 4)


def _valid_position(position: Any) -> bool:
    return (
        isinstance(position, list)
        and len(position) >= 2
        and all(isinstance(value, (int, float)) for value in position[:2])
        and -180 <= position[0] <= 180
        and -90 <= position[1] <= 90
    )


def validate_feature_collection(document: dict[str, Any]) -> QualityReport:
    """Validate the structural minimum required before spatial ingestion."""

    report = QualityReport()
    if document.get("type") != "FeatureCollection":
        report.issues.append(
            QualityIssue("invalid_root", "Expected a FeatureCollection")
        )
        return report

    features = document.get("features")
    if not isinstance(features, list):
        report.issues.append(
            QualityIssue("missing_features", "features must be a list")
        )
        return report

    report.feature_count = len(features)
    seen_ids: set[str] = set()
    for index, feature in enumerate(features):
        feature_valid = True
        feature_id = str(feature.get("id", ""))
        if not feature_id:
            report.issues.append(
                QualityIssue("missing_id", "Feature id is required", index)
            )
            feature_valid = False
        elif feature_id in seen_ids:
            report.issues.append(
                QualityIssue("duplicate_id", f"Duplicate id: {feature_id}", index)
            )
            feature_valid = False
        seen_ids.add(feature_id)

        geometry = feature.get("geometry") or {}
        if geometry.get("type") == "Point":
            if not _valid_position(geometry.get("coordinates")):
                report.issues.append(
                    QualityIssue("invalid_position", "Invalid lon/lat", index)
                )
                feature_valid = False
        elif geometry.get("type") not in {
            "Polygon",
            "MultiPolygon",
            "LineString",
            "MultiLineString",
        }:
            report.issues.append(
                QualityIssue("unsupported_geometry", "Unsupported geometry type", index)
            )
            feature_valid = False

        if feature_valid:
            report.valid_feature_count += 1

    if not features:
        report.issues.append(
            QualityIssue("empty_dataset", "Dataset has no features", severity="warning")
        )
    return report
