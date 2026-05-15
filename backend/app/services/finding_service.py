"""Create high-signal defensive findings with required narrative fields."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.asset import Asset, AssetType
from app.models.finding import Finding, FindingSeverity, FindingStatus


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_or_create_asset(
    db: Session,
    *,
    organization_id: uuid.UUID,
    domain_id: uuid.UUID | None,
    asset_type: AssetType,
    value: str,
    metadata: dict[str, Any] | None = None,
) -> tuple[Asset, bool]:
    stmt = (
        select(Asset)
        .where(
            Asset.organization_id == organization_id,
            Asset.asset_type == asset_type,
            Asset.value == value,
        )
        .limit(1)
    )
    existing = db.execute(stmt).scalar_one_or_none()
    if existing:
        existing.last_seen_at = utcnow()
        if metadata:
            merged = dict(existing.metadata_json or {})
            merged.update(metadata)
            existing.metadata_json = merged
        return existing, False

    asset = Asset(
        organization_id=organization_id,
        domain_id=domain_id,
        asset_type=asset_type,
        value=value,
        metadata_json=metadata,
        first_seen_at=utcnow(),
        last_seen_at=utcnow(),
    )
    db.add(asset)
    db.flush()
    return asset, True


def create_finding(
    db: Session,
    *,
    organization_id: uuid.UUID,
    asset_id: uuid.UUID | None,
    severity: FindingSeverity,
    title: str,
    description: str,
    impact: str,
    recommendation: str,
    evidence: dict[str, Any],
    detected_at: datetime | None = None,
) -> Finding:
    row = Finding(
        organization_id=organization_id,
        asset_id=asset_id,
        severity=severity,
        status=FindingStatus.open,
        title=title,
        description=description,
        impact=impact,
        recommendation=recommendation,
        evidence=evidence,
        detected_at=detected_at or utcnow(),
    )
    db.add(row)
    return row


def new_subdomain_finding(
    db: Session,
    *,
    organization_id: uuid.UUID,
    domain_id: uuid.UUID,
    subdomain: str,
) -> Finding:
    asset, _created = get_or_create_asset(
        db,
        organization_id=organization_id,
        domain_id=domain_id,
        asset_type=AssetType.subdomain,
        value=subdomain,
        metadata={"source": "certificate_transparency"},
    )
    return create_finding(
        db,
        organization_id=organization_id,
        asset_id=asset.id,
        severity=FindingSeverity.info,
        title=f"New subdomain observed: {subdomain}",
        description=(
            "A new hostname referencing your authorized domain appeared in passive "
            "certificate transparency logs. This is typically inventory noise, but can "
            "signal new external surface area."
        ),
        impact=(
            "Increased external attack surface can expand phishing, takeover, and "
            "misconfiguration risk if the hostname is unintentional or unmanaged."
        ),
        recommendation=(
            "Confirm ownership and intended use; ensure DNS, TLS, and access controls "
            "match your security baseline; decommission unused hostnames when safe."
        ),
        evidence={
            "subdomain": subdomain,
            "registered_domain_id": str(domain_id),
            "source": "crt.sh",
        },
    )


def tls_certificate_finding(
    db: Session,
    *,
    organization_id: uuid.UUID,
    domain_id: uuid.UUID,
    hostname: str,
    severity: FindingSeverity,
    reason: str,
    evidence: dict[str, Any],
) -> Finding:
    asset, _ = get_or_create_asset(
        db,
        organization_id=organization_id,
        domain_id=domain_id,
        asset_type=AssetType.tls_endpoint,
        value=f"https://{hostname}:443",
        metadata={"reason": reason},
    )
    title = {
        "expired": f"Expired TLS certificate on {hostname}",
        "expires_within_7_days": f"TLS certificate expiring soon (<=7 days) on {hostname}",
        "expires_within_30_days": f"TLS certificate expiring within 30 days on {hostname}",
        "self_signed": f"Likely self-signed TLS certificate on {hostname}",
    }.get(reason, f"TLS certificate issue on {hostname}")
    descriptions = {
        "expired": "The server's presented certificate is beyond its validity window.",
        "expires_within_7_days": "The certificate is nearing expiration within one week.",
        "expires_within_30_days": "The certificate expires within thirty days.",
        "self_signed": "The server's certificate issuer matches its subject (self-signed heuristic).",
    }
    impacts = {
        "expired": "Clients may fail validation, enabling outages or downgrade patterns.",
        "expires_within_7_days": "An imminent outage or validation failure risk exists for dependent services.",
        "expires_within_30_days": "Operational risk increases as renewal deadlines approach.",
        "self_signed": "Clients that require public trust anchors may refuse connections.",
    }
    recs = {
        "expired": "Renew/replace certificates using your approved CA workflow and redeploy promptly.",
        "expires_within_7_days": "Expedite renewal and validate automated issuance before expiry.",
        "expires_within_30_days": "Schedule renewal and validate monitoring alerts for regressions.",
        "self_signed": "Replace self-signed certs with publicly trusted certs unless explicitly required.",
    }
    return create_finding(
        db,
        organization_id=organization_id,
        asset_id=asset.id,
        severity=severity,
        title=title,
        description=descriptions.get(reason, descriptions["expired"]),
        impact=impacts.get(reason, impacts["expired"]),
        recommendation=recs.get(reason, recs["expired"]),
        evidence=evidence,
    )


def dns_change_finding(
    db: Session,
    *,
    organization_id: uuid.UUID,
    domain_id: uuid.UUID,
    record_type: str,
    before_records: list[Any],
    after_records: list[Any],
    before_hash: str,
    after_hash: str,
) -> Finding:
    dns_key = f"dns:{record_type}"
    asset, _ = get_or_create_asset(
        db,
        organization_id=organization_id,
        domain_id=domain_id,
        asset_type=AssetType.dns_record,
        value=dns_key,
        metadata={"record_type": record_type},
    )
    return create_finding(
        db,
        organization_id=organization_id,
        asset_id=asset.id,
        severity=FindingSeverity.medium,
        title=f"DNS {record_type} records changed",
        description=(
            f"The normalized {record_type} RRset fingerprint changed versus the prior snapshot. "
            "This may be expected (migration) or unexpected (misconfiguration/compromise)."
        ),
        impact=(
            "DNS changes can redirect mail, web, or authentication flows, affecting availability "
            "and integrity of user-facing services."
        ),
        recommendation=(
            "Validate the change against change management records; confirm registrar and DNS "
            "access logs; revert if unintended."
        ),
        evidence={
            "record_type": record_type,
            "before_records": before_records,
            "after_records": after_records,
            "before_hash": before_hash,
            "after_hash": after_hash,
            "domain_id": str(domain_id),
        },
    )


def public_bucket_listing_finding(
    db: Session,
    *,
    organization_id: uuid.UUID,
    domain_id: uuid.UUID | None,
    provider: str,
    bucket: str,
    url_checked: str,
    status_code: int | None,
) -> Finding:
    asset, _ = get_or_create_asset(
        db,
        organization_id=organization_id,
        domain_id=domain_id,
        asset_type=AssetType.bucket,
        value=f"{provider}:{bucket}",
        metadata={"url_checked": url_checked, "status_code": status_code},
    )
    return create_finding(
        db,
        organization_id=organization_id,
        asset_id=asset.id,
        severity=FindingSeverity.high,
        title=f"Possible public bucket listing: {provider} / {bucket}",
        description=(
            "A read-only probe returned a response consistent with object listing markup. "
            "This strongly suggests unintended public enumeration risk."
        ),
        impact=(
            "Attackers may inventory object keys and infer sensitive workloads, widening data "
            "exposure depending on ACLs."
        ),
        recommendation=(
            "Disable public ACLs/listing, enforce bucket policies requiring authentication, "
            "rotate any exposed secrets found in indexes, and review audit logs."
        ),
        evidence={
            "provider": provider,
            "bucket": bucket,
            "url_checked": url_checked,
            "status_code": status_code,
            "classification": "read_only_inventory_probe",
        },
    )


def record_bucket_inventory_only(
    db: Session,
    *,
    organization_id: uuid.UUID,
    domain_id: uuid.UUID | None,
    provider: str,
    bucket: str,
    url_checked: str,
    status_code: int | None,
) -> Asset:
    """Bucket responded but listing not detected — store surface without raising a finding."""

    asset, _ = get_or_create_asset(
        db,
        organization_id=organization_id,
        domain_id=domain_id,
        asset_type=AssetType.bucket,
        value=f"{provider}:{bucket}",
        metadata={
            "url_checked": url_checked,
            "status_code": status_code,
            "note": "candidate_observed_without_public_listing",
        },
    )
    return asset
