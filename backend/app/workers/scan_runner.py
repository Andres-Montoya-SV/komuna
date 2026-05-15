"""Execute queued defensive scans."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.asset import Asset, AssetType
from app.models.dns_snapshot import DnsSnapshot
from app.models.domain import Domain
from app.models.scan import Scan, ScanStatus, ScanType
from app.services import finding_service
from app.services.bucket_service import heuristic_bucket_candidates, probe_candidates
from app.services.dns_service import collect_all_supported, fingerprint_records, snapshot_changed
from app.services.domain_validation import resolved_addresses_are_safe
from app.services.subdomain_service import sync_fetch_crt_subdomains
from app.services.tls_service import fetch_certificate, severity_for_expiry_and_trust

logger = logging.getLogger(__name__)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _support_hostnames(
    db: Session,
    *,
    domain: Domain,
    discovered_subdomains: list[str],
    scan_type: ScanType,
) -> list[str]:
    hosts: set[str] = {domain.name.lower().rstrip("."), f"www.{domain.name.lower().rstrip('.')}"}
    hosts.update(h.lower().rstrip(".") for h in discovered_subdomains)

    if scan_type not in (ScanType.subdomain,):
        stmt = (
            select(Asset.value)
            .where(
                Asset.organization_id == domain.organization_id,
                Asset.domain_id == domain.id,
                Asset.asset_type == AssetType.subdomain,
            )
            .limit(40)
        )
        for row in db.execute(stmt).all():
            hosts.add(row[0].lower().rstrip("."))

    return sorted(hosts)[:90]


def _run_subdomain_pass(
    *,
    db: Session,
    domain: Domain,
    summary: dict[str, Any],
) -> list[str]:
    subs = sync_fetch_crt_subdomains(domain.name)
    new_assets = 0
    findings = 0
    for host in subs:
        if host == domain.name.lower().rstrip("."):
            continue
        asset, created = finding_service.get_or_create_asset(
            db,
            organization_id=domain.organization_id,
            domain_id=domain.id,
            asset_type=AssetType.subdomain,
            value=host,
            metadata={"source": "crt.sh"},
        )
        if created:
            new_assets += 1
            finding_service.new_subdomain_finding(
                db,
                organization_id=domain.organization_id,
                domain_id=domain.id,
                subdomain=host,
            )
            findings += 1

    summary["subdomain"] = {
        "observed": len(subs),
        "new_inventory_assets": new_assets,
        "new_informational_findings": findings,
        "sources": ["https://crt.sh"],
    }
    return subs


def _run_tls_pass(
    *,
    db: Session,
    domain: Domain,
    tls_hosts: list[str],
    summary: dict[str, Any],
) -> None:
    results: dict[str, Any] = {}
    findings = 0
    for hostname in tls_hosts:
        ok, reason = resolved_addresses_are_safe(hostname)
        if not ok:
            results[hostname] = {"skipped": True, "reason": reason}
            continue
        try:
            info = fetch_certificate(hostname)
        except Exception as e:
            results[hostname] = {"skipped": False, "error": e.__class__.__name__}
            continue

        expired = info.is_expired()
        days_left = info.days_until_expiry() if not expired else None
        self_signed = info.detected_self_signed()
        sev, reason_key = severity_for_expiry_and_trust(
            days_left=days_left,
            expired=expired,
            self_signed=self_signed,
        )

        tls_payload = {
            "issuer": info.issuer,
            "subject": info.subject,
            "not_before": info.not_before.isoformat(),
            "not_after": info.not_after.isoformat(),
            "san_dns_names": list(info.san_dns_names),
            "resolved_safe": True,
            "reason_key": reason_key,
            "self_signed": self_signed,
        }
        results[hostname] = tls_payload

        if sev is None:
            continue

        findings += 1
        finding_service.tls_certificate_finding(
            db,
            organization_id=domain.organization_id,
            domain_id=domain.id,
            hostname=hostname,
            severity=sev,
            reason=reason_key or "unknown",
            evidence=tls_payload,
        )

    summary["tls"] = {"hosts_attempted": len(tls_hosts), "findings": findings, "details": results}


def _run_dns_pass(
    *,
    db: Session,
    domain: Domain,
    summary: dict[str, Any],
) -> None:
    records_map = collect_all_supported(domain.name)
    changes = 0
    snap_summary: dict[str, Any] = {}

    for rtype, rr_values in records_map.items():
        new_hash = fingerprint_records(rr_values)

        stmt = (
            select(DnsSnapshot)
            .where(
                DnsSnapshot.domain_id == domain.id,
                DnsSnapshot.record_type == rtype,
            )
            .order_by(desc(DnsSnapshot.created_at))
            .limit(1)
        )
        prev = db.execute(stmt).scalar_one_or_none()

        snap_summary[rtype] = {"record_count": len(rr_values), "fingerprint": new_hash}
        if prev is not None and snapshot_changed(prev.fingerprint_hash, new_hash):
            finding_service.dns_change_finding(
                db,
                organization_id=domain.organization_id,
                domain_id=domain.id,
                record_type=rtype,
                before_records=list(prev.records),
                after_records=rr_values,
                before_hash=prev.fingerprint_hash,
                after_hash=new_hash,
            )
            changes += 1

        db.add(
            DnsSnapshot(
                domain_id=domain.id,
                record_type=rtype,
                records=list(rr_values),
                fingerprint_hash=new_hash,
            ),
        )

    summary["dns"] = {"record_types_checked": len(records_map), "change_findings": changes, "fingerprints": snap_summary}


def _run_bucket_pass(
    *,
    db: Session,
    domain: Domain,
    tls_hosts: list[str],
    summary: dict[str, Any],
) -> None:
    cands = heuristic_bucket_candidates(domain.name, tls_hosts)
    cands = cands[:45]
    results = probe_candidates(cands)

    listings = 0
    inventories = 0
    probe_summary: dict[str, Any] = {}

    dedup_seen: set[tuple[str, str]] = set()

    for r in results:
        key = ((r.provider.value if r.provider else "unknown"), r.bucket_name)
        if key in dedup_seen:
            continue
        dedup_seen.add(key)

        provider = r.provider.value if r.provider else "unknown"

        probe_summary.setdefault(r.bucket_name, {}).update(
            {
                provider: {
                    "url_checked": r.url_checked,
                    "status_code": r.status_code,
                    "public_listing_likely": r.public_listing_likely,
                    "note": r.note,
                },
            },
        )

        if r.public_listing_likely:
            listings += 1
            finding_service.public_bucket_listing_finding(
                db,
                organization_id=domain.organization_id,
                domain_id=domain.id,
                provider=provider,
                bucket=r.bucket_name,
                url_checked=r.url_checked,
                status_code=r.status_code,
            )
            continue

        # Best-effort: explicit deny often implies the bucket/account exists publicly addressable,
        # but listing is forbidden (still inventory-only; never upload/delete).
        if r.status_code == 403 and r.bucket_name:
            inventories += 1
            finding_service.record_bucket_inventory_only(
                db,
                organization_id=domain.organization_id,
                domain_id=domain.id,
                provider=provider,
                bucket=r.bucket_name,
                url_checked=r.url_checked,
                status_code=r.status_code,
            )

    summary["bucket"] = {
        "candidates_checked": len(cands),
        "providers_probed": ["s3_virtual_host", "gcs_bucket"],
        "public_listing_findings": listings,
        "inventory_only_assets": inventories,
        "details": probe_summary,
    }


def execute_scan(db: Session, scan: Scan) -> None:
    summary: dict[str, Any] = {}

    scan.status = ScanStatus.running
    scan.started_at = utcnow()
    scan.finished_at = None

    if scan.domain_id is None:
        scan.status = ScanStatus.failed
        scan.finished_at = utcnow()
        scan.result_summary = {"error": "missing_domain_id"}
        return

    domain = db.get(Domain, scan.domain_id)

    if domain is None:
        scan.status = ScanStatus.failed
        scan.finished_at = utcnow()
        scan.result_summary = {"error": "domain_not_found"}
        return

    if not domain.verified:
        scan.status = ScanStatus.failed
        scan.finished_at = utcnow()
        scan.result_summary = {"error": "domain_not_verified"}
        return

    try:
        discovered: list[str] = []
        if scan.scan_type in (ScanType.subdomain, ScanType.full):
            discovered = _run_subdomain_pass(db=db, domain=domain, summary=summary)

        support_hosts: list[str] = []
        if scan.scan_type in (ScanType.tls, ScanType.bucket, ScanType.full):
            support_hosts = _support_hostnames(
                db,
                domain=domain,
                discovered_subdomains=discovered if scan.scan_type == ScanType.full else [],
                scan_type=scan.scan_type,
            )

        if scan.scan_type in (ScanType.tls, ScanType.full):
            _run_tls_pass(db=db, domain=domain, tls_hosts=support_hosts, summary=summary)

        if scan.scan_type in (ScanType.dns, ScanType.full):
            _run_dns_pass(db=db, domain=domain, summary=summary)

        if scan.scan_type in (ScanType.bucket, ScanType.full):
            _run_bucket_pass(db=db, domain=domain, tls_hosts=support_hosts, summary=summary)

        scan.status = ScanStatus.completed
        scan.result_summary = summary
        logger.info(
            "scan_completed",
            extra={"scan_id": str(scan.id), "domain_id": str(domain.id), "type": scan.scan_type.value},
        )
    except Exception as e:
        logger.warning(
            "scan_failed_unexpected",
            extra={"scan_id": str(scan.id), "domain_id": str(domain.id), "error_type": type(e).__name__},
        )
        scan.status = ScanStatus.failed
        scan.result_summary = {**summary, "error_type": type(e).__name__, "error": repr(e)}
    finally:
        scan.finished_at = utcnow()


def drain_scan_queue(db: Session, *, limit: int = 10) -> int:
    """Process up to ``limit`` queued scans; returns processed count."""

    stmt = (
        select(Scan)
        .where(Scan.status == ScanStatus.queued)
        .order_by(Scan.created_at.asc())
        .limit(limit)
    )
    scans = db.execute(stmt).scalars().all()
    for scan in scans:
        execute_scan(db, scan)
    return len(scans)
