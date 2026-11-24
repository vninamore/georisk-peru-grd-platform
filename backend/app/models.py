"""Validated API contracts for disaster-risk scenarios."""

from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class HazardType(StrEnum):
    FLOOD = "flood"
    LANDSLIDE = "landslide"
    EARTHQUAKE = "earthquake"
    WILDFIRE = "wildfire"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class Vulnerability(BaseModel):
    """Normalized vulnerability dimensions in the [0, 1] range."""

    model_config = ConfigDict(extra="forbid")

    physical: float = Field(ge=0, le=1)
    social: float = Field(ge=0, le=1)
    economic: float = Field(ge=0, le=1)
    environmental: float = Field(ge=0, le=1)


class RiskRequest(BaseModel):
    """Inputs required to evaluate one territorial unit."""

    model_config = ConfigDict(extra="forbid")

    unit_id: str = Field(min_length=1, max_length=80, pattern=r"^[A-Za-z0-9._-]+$")
    hazard_type: HazardType = HazardType.FLOOD
    hazard: float = Field(ge=0, le=1, description="Normalized hazard intensity")
    exposure: float = Field(ge=0, le=1, description="Normalized exposure")
    vulnerability: Vulnerability
    confidence: float = Field(default=1.0, ge=0, le=1)


class RiskResponse(BaseModel):
    unit_id: str
    hazard_type: HazardType
    hazard_index: float
    exposure_index: float
    vulnerability_index: float
    risk_score: float
    adjusted_risk_score: float
    risk_level: RiskLevel
    confidence: float
    method_version: str = "1.0.0"


class BatchRiskRequest(BaseModel):
    scenarios: list[RiskRequest] = Field(min_length=1, max_length=1000)

    @model_validator(mode="after")
    def unique_units(self) -> "BatchRiskRequest":
        keys = [(item.unit_id, item.hazard_type) for item in self.scenarios]
        if len(keys) != len(set(keys)):
            raise ValueError("unit_id and hazard_type combinations must be unique")
        return self


class BatchSummary(BaseModel):
    count: int
    mean_risk: float
    maximum_risk: float
    by_level: dict[RiskLevel, int]
    results: list[RiskResponse]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
