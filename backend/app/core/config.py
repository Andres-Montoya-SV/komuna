from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    env: Literal["development", "staging", "production"] = "development"
    log_level: str = "INFO"

    database_url: str = Field(
        default="postgresql://exposure:exposure@localhost:5432/exposure",
        alias="DATABASE_URL",
    )

    # Firebase Admin: path to JSON key OR leave empty if using ADC.
    firebase_credentials_path: str | None = Field(
        default=None,
        alias="FIREBASE_CREDENTIALS_PATH",
    )
    # Optional comma-separated Firebase project IDs to accept (empty = any project in creds).
    firebase_allowed_audiences: str = Field(
        default="", alias="FIREBASE_ALLOWED_AUDIENCES"
    )

    # Scheduler
    scan_poll_interval_seconds: int = Field(
        default=30, alias="SCAN_POLL_INTERVAL_SECONDS"
    )
    scheduled_scan_enabled: bool = Field(default=True, alias="SCHEDULED_SCAN_ENABLED")
    scheduled_scan_interval_hours: int = Field(
        default=24, alias="SCHEDULED_SCAN_INTERVAL_HOURS"
    )

    # Defensive limits
    crt_sh_timeout_seconds: float = Field(default=30.0, alias="CRT_SH_TIMEOUT_SECONDS")
    http_timeout_seconds: float = Field(default=15.0, alias="HTTP_TIMEOUT_SECONDS")
    dns_timeout_seconds: float = Field(default=10.0, alias="DNS_TIMEOUT_SECONDS")

    @property
    def firebase_audience_list(self) -> list[str]:
        return [
            x.strip() for x in self.firebase_allowed_audiences.split(",") if x.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
