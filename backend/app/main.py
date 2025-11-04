"""FastAPI application bootstrap."""
from fastapi import FastAPI
from fastapi.responses import JSONResponse, RedirectResponse

from app.api.router import api_router
from app.core.config import settings
from app.schemas.health import HealthStatus


def create_application() -> FastAPI:
    """Instantiate the FastAPI app with routers and metadata."""

    application = FastAPI(title=settings.api_title, version=settings.api_version)
    application.include_router(api_router, prefix=settings.api_prefix)

    @application.get("/", include_in_schema=False)
    def home() -> RedirectResponse:
        """Redirect root traffic to the interactive documentation."""

        return RedirectResponse(url="/docs")

    @application.get("/health", response_model=HealthStatus, include_in_schema=False)
    def healthcheck() -> JSONResponse:
        """Expose legacy health endpoint without versioning."""

        status = HealthStatus()
        return JSONResponse(status.model_dump())

    return application


app = create_application()
