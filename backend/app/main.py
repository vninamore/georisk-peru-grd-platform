"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import get_settings
from app.models import HealthResponse
from app.routes import router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=__version__,
    summary="API reproducible para análisis multiamenaza de GRD",
    description=(
        "Calcula índices normalizados de peligro, exposición, vulnerabilidad y riesgo. "
        "Los datos de demostración son sintéticos y no representan información oficial."
    ),
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    contact={"name": "Vanessa Jazmín Nina More", "url": "https://vninamore.github.io/"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(router)


@app.get("/health", response_model=HealthResponse, tags=["Operations"])
def health() -> HealthResponse:
    """Liveness endpoint for containers and monitoring."""

    return HealthResponse(status="ok", service=settings.app_name, version=__version__)
