"""Passive subdomain discovery via certificate transparency (low impact).

Uses public crt.sh APIs only; no brute force or guessing.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import Settings, get_settings
from app.services.domain_validation import filter_safe_hosts, normalize_domain

logger = logging.getLogger(__name__)


def _extract_names(entry: dict[str, Any]) -> list[str]:
    names = entry.get("name_value") or entry.get("common_name") or ""
    raw = names if isinstance(names, str) else str(names)
    return [part.strip().lower().rstrip(".") for part in raw.split("\n") if part.strip()]


async def fetch_crt_subdomains(
    apex_domain: str,
    *,
    client: httpx.AsyncClient | None = None,
    settings: Settings | None = None,
) -> list[str]:
    """Return normalized subdomain hostnames mentioning the apex (best-effort)."""
    settings = settings or get_settings()
    apex = normalize_domain(apex_domain)
    q = f"%.{apex}"
    url = "https://crt.sh/"
    params = {"q": q, "output": "json"}
    owns_client = client is None
    c = client or httpx.AsyncClient(timeout=settings.crt_sh_timeout_seconds)
    try:
        resp = await c.get(url, params=params)
        resp.raise_for_status()
        rows = resp.json()
        seen: set[str] = set()
        if not isinstance(rows, list):
            logger.warning(
                "crt_sh_unexpected_shape",
                extra={"apex_domain": apex, "type": type(rows).__name__},
            )
            return []
        for entry in rows:
            if not isinstance(entry, dict):
                continue
            for n in _extract_names(entry):
                if n == apex or n.endswith(f".{apex}"):
                    seen.add(n)
        return filter_safe_hosts(sorted(seen))
    except httpx.HTTPError as e:
        logger.warning(
            "crt_sh_http_error",
            extra={"apex_domain": apex, "error_type": type(e).__name__},
        )
        return []
    finally:
        if owns_client:
            await c.aclose()


def sync_fetch_crt_subdomains(apex_domain: str, *, settings: Settings | None = None) -> list[str]:
    """Synchronous wrapper for worker code paths."""
    settings = settings or get_settings()
    apex = normalize_domain(apex_domain)
    q = f"%.{apex}"
    params = {"q": q, "output": "json"}
    with httpx.Client(timeout=settings.crt_sh_timeout_seconds) as c:
        try:
            resp = c.get("https://crt.sh/", params=params)
            resp.raise_for_status()
            rows = resp.json()
        except httpx.HTTPError as e:
            logger.warning(
                "crt_sh_http_error",
                extra={"apex_domain": apex, "error_type": type(e).__name__},
            )
            return []
    if not isinstance(rows, list):
        return []
    seen: set[str] = set()
    for entry in rows:
        if not isinstance(entry, dict):
            continue
        for n in _extract_names(entry):
            if n == apex or n.endswith(f".{apex}"):
                seen.add(n)
    return filter_safe_hosts(sorted(seen))
