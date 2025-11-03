"""Application settings management."""
from functools import lru_cache

from pydantic import BaseSettings, Field, PostgresDsn, validator


class Settings(BaseSettings):
    """Server configuration exposed to the app."""

    api_title: str = Field("GetInvolved API", description="Displayed API title")
    api_version: str = Field("0.1.0", description="Semver version of the API")
    api_prefix: str = Field("/api", description="Prefix applied to versioned routes")

    database_url: PostgresDsn = Field(
        "postgresql+psycopg2://postgres:postgres@db:5432/getinvolved",
        description="SQLAlchemy connection string",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @validator("database_url", pre=True)
    def assemble_db_connection(cls, value: str | None) -> str:
        """Allow DATABASE_URL env var overriding the DSN."""
        if isinstance(value, str):
            return value
        raise ValueError("DATABASE_URL must be provided as a string")


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()


settings = get_settings()
