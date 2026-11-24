"""Application configuration with safe development defaults."""

import json
import os
from functools import lru_cache

from pydantic import BaseModel, Field, field_validator


class Settings(BaseModel):
    """Runtime settings loaded from environment variables."""

    app_name: str = "GeoRisk Peru API"
    environment: str = "development"
    database_url: str = "postgresql://georisk:georisk-dev@localhost:5432/georisk"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    log_level: str = "INFO"
    risk_weights: dict[str, float] = Field(
        default_factory=lambda: {
            "physical": 0.35,
            "social": 0.30,
            "economic": 0.20,
            "environmental": 0.15,
        }
    )

    @field_validator("risk_weights")
    @classmethod
    def valid_weight_total(cls, value: dict[str, float]) -> dict[str, float]:
        if abs(sum(value.values()) - 1.0) > 1e-9:
            raise ValueError("risk weights must sum to 1.0")
        return value

    @property
    def allowed_origins(self) -> list[str]:
        """Return normalized CORS origins."""

        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings object."""

    weights = os.getenv("RISK_WEIGHTS")
    return Settings(
        app_name=os.getenv("APP_NAME", "GeoRisk Peru API"),
        environment=os.getenv("ENVIRONMENT", "development"),
        database_url=os.getenv(
            "DATABASE_URL", "postgresql://georisk:georisk-dev@localhost:5432/georisk"
        ),
        cors_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"),
        log_level=os.getenv("LOG_LEVEL", "INFO"),
        **({"risk_weights": json.loads(weights)} if weights else {}),
    )
