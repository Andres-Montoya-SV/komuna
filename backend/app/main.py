"""Exposure Monitor — FastAPI MVP backend (defensive-only)."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def configure_logging() -> None:
    settings = get_settings()
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()

    from app.workers.scheduler import create_scheduler

    scheduler = create_scheduler()
    scheduler.start()
    logger.info(
        "app_startup",
        extra={
            "env": get_settings().env,
            "scan_poll_seconds": get_settings().scan_poll_interval_seconds,
        },
    )
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


def create_application() -> FastAPI:
    application = FastAPI(
        title="Exposure Monitor API",
        version="0.1.0-mvp",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix="/api/v1")

    @application.get("/health")
    def health():
        return {"status": "ok"}

    return application


app = create_application()
