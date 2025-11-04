"""Application settings management."""
from functools import lru_cache

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Server configuration exposed to the app."""

    api_title: str = Field("GetInvolved API", description="Displayed API title")
    api_version: str = Field("0.1.0", description="Semver version of the API")
    api_prefix: str = Field("/api", description="Prefix applied to versioned routes")

    database_url: PostgresDsn = Field(
        "postgresql+psycopg2://postgres:postgres@db:5432/getinvolved",
        description="SQLAlchemy connection string",
    )

    # Pydantic v2 settings configuration
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False
    )

    @field_validator("database_url", mode="before")
    def assemble_db_connection(cls, value: str | None) -> str:
        """Ensure `DATABASE_URL` is provided as a string."""
        if isinstance(value, str):
            return value
        raise ValueError("DATABASE_URL must be provided as a string")


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()


settings = get_settings()
