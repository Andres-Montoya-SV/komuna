"""Read-only probing for publicly exposed object storage buckets (inventory only).

No authentication bypass, uploads, deletes, or credential guessing.
"""

from __future__ import annotations

import logging
from enum import StrEnum
from typing import NamedTuple

import httpx

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


class BucketProvider(StrEnum):
    s3 = "s3"
    gcs = "gcs"
    azure_blob = "azure_blob"


class BucketProbeResult(NamedTuple):
    provider: BucketProvider | None
    bucket_name: str
    url_checked: str
    status_code: int | None
    public_listing_likely: bool
    note: str


def _snippet_has_public_list_indicators(body: str) -> bool:
    lowered = body[:16384].lower()
    if "<listbucketresult" in lowered:
        return True
    if "listbucketresult" in lowered.replace(" ", ""):
        return True
    # GCS occasionally returns bucket XML listing patterns
    if "<contents>" in lowered and "<key>" in lowered and "amazonaws" in lowered:
        return True
    return False


def probe_s3_virtual_hosted(bucket: str, client: httpx.Client) -> BucketProbeResult:
    url = f"https://{bucket}.s3.amazonaws.com/"
    try:
        resp = client.get(url)
        snippet = ""
        try:
            snippet = resp.text
        except Exception:
            snippet = ""
        listing = resp.status_code == 200 and _snippet_has_public_list_indicators(
            snippet
        )
        note = "s3_virtual_hosted_get"
        return BucketProbeResult(
            provider=BucketProvider.s3,
            bucket_name=bucket,
            url_checked=url,
            status_code=resp.status_code,
            public_listing_likely=listing,
            note=note,
        )
    except httpx.HTTPError as e:
        return BucketProbeResult(
            provider=BucketProvider.s3,
            bucket_name=bucket,
            url_checked=url,
            status_code=None,
            public_listing_likely=False,
            note=f"http_error:{type(e).__name__}",
        )


def probe_gcs_bucket(bucket: str, client: httpx.Client) -> BucketProbeResult:
    url = f"https://storage.googleapis.com/{bucket}"
    try:
        resp = client.get(url)
        snippet = ""
        try:
            snippet = resp.text
        except Exception:
            snippet = ""
        listing = resp.status_code == 200 and _snippet_has_public_list_indicators(
            snippet
        )
        return BucketProbeResult(
            provider=BucketProvider.gcs,
            bucket_name=bucket,
            url_checked=url,
            status_code=resp.status_code,
            public_listing_likely=listing,
            note="gcs_get",
        )
    except httpx.HTTPError as e:
        return BucketProbeResult(
            provider=BucketProvider.gcs,
            bucket_name=bucket,
            url_checked=url,
            status_code=None,
            public_listing_likely=False,
            note=f"http_error:{type(e).__name__}",
        )


def heuristic_bucket_candidates(apex: str, hosts: list[str]) -> list[str]:
    """Derive conservative candidate bucket labels from apex/subdomains."""

    apex = apex.strip().lower().rstrip(".")
    names: set[str] = set()
    if apex:
        names.add(apex.split(".")[0])
        names.add(apex.replace(".", "-"))
        names.add(f"{apex}-assets")
        names.add(f"{apex}-production")
        names.add(f"{apex}-prod")
    for host in hosts:
        h = host.strip().lower().rstrip(".")
        if not h:
            continue
        first = h.split(".")[0]
        if len(first) >= 3:
            names.add(first)
            names.add(first.replace(".", "-"))
    return sorted(n for n in names if 3 <= len(n) <= 63)


def probe_candidates(
    candidates: list[str],
    *,
    settings: Settings | None = None,
) -> list[BucketProbeResult]:
    settings = settings or get_settings()
    results: list[BucketProbeResult] = []
    timeout = float(settings.http_timeout_seconds)
    headers = {
        "User-Agent": "ExposureMonitor/1.0 (defensive inventory; +https://example.invalid)",
    }
    with httpx.Client(
        timeout=timeout, follow_redirects=False, headers=headers
    ) as client:
        for name in candidates:
            results.append(probe_s3_virtual_hosted(name, client))
            results.append(probe_gcs_bucket(name, client))
    return results
