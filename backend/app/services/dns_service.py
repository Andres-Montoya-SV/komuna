"""DNS queries and snapshot fingerprinting for change detection."""

from __future__ import annotations

import hashlib
import json
import logging

import dns.resolver
from dns.exception import DNSException

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)

SUPPORTED_RECORD_TYPES: tuple[str, ...] = ("A", "AAAA", "CNAME", "MX", "NS", "TXT")


def normalize_records(records: list[str]) -> list[str]:
    return sorted({r.strip() for r in records})


def fingerprint_records(records: list[str]) -> str:
    norm = normalize_records(records)
    blob = json.dumps(norm, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def collect_rrset(hostname: str, rtype: str, *, timeout: float) -> list[str]:
    resolver = dns.resolver.Resolver()
    resolver.lifetime = timeout
    try:
        answers = resolver.resolve(hostname, rtype)
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers):
        return []
    except DNSException as e:
        logger.info(
            "dns_query_dns_exception",
            extra={
                "hostname": hostname,
                "rtype": rtype,
                "error_type": type(e).__name__,
            },
        )
        return []
    values: list[str] = []
    try:
        for rr in answers:
            values.append(rr.to_text().strip().strip('"'))
    except Exception as e:
        logger.info(
            "dns_rr_to_text_failed",
            extra={
                "hostname": hostname,
                "rtype": rtype,
                "error_type": type(e).__name__,
            },
        )
        return []
    return sorted(set(values))


def collect_all_supported(
    hostname: str,
    *,
    settings: Settings | None = None,
) -> dict[str, list[str]]:
    settings = settings or get_settings()
    timeout = float(settings.dns_timeout_seconds)
    return {
        rtype: collect_rrset(hostname, rtype, timeout=timeout)
        for rtype in SUPPORTED_RECORD_TYPES
    }


def snapshot_changed(previous_hash: str | None, new_hash: str) -> bool:
    return previous_hash is not None and previous_hash != new_hash
