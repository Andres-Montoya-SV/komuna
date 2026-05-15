from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import current_user
from app.core.config import get_settings
from app.db.session import get_session
from app.models.domain import Domain, new_verification_token
from app.models.scan import Scan, ScanStatus, ScanType
from app.models.user import User
from app.schemas.domain import (
    DomainCreate,
    DomainOut,
    DomainScanResponse,
    DomainVerifyResponse,
)
from app.services.authorization import require_membership
from app.services.domain_validation import (
    assert_domain_allowed_for_operations,
    normalize_domain,
    verify_challenge_txt_presence,
)

router = APIRouter(prefix="/domains", tags=["domains"])


@router.post("", response_model=DomainOut, status_code=status.HTTP_201_CREATED)
def register_domain(
    payload: DomainCreate,
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
) -> Domain:
    try:
        norm = normalize_domain(payload.name)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e

    try:
        assert_domain_allowed_for_operations(norm)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e

    _ = require_membership(db, user_id=user.id, organization_id=payload.organization_id)

    domain = Domain(
        organization_id=payload.organization_id,
        name=norm,
        verified=False,
        verification_token=new_verification_token(),
    )
    db.add(domain)
    return domain


@router.get("", response_model=list[DomainOut])
def list_domains(
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
    organization_id: Annotated[uuid.UUID, Query()],
) -> list[Domain]:
    _ = require_membership(db, user_id=user.id, organization_id=organization_id)
    stmt = (
        select(Domain)
        .where(Domain.organization_id == organization_id)
        .order_by(Domain.created_at.asc())
    )
    return list(db.execute(stmt).scalars().unique().all())


@router.post("/{domain_id}/verify", response_model=DomainVerifyResponse)
def verify_domain(
    domain_id: uuid.UUID,
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
) -> DomainVerifyResponse:
    domain = db.get(Domain, domain_id)
    if domain is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    _ = require_membership(db, user_id=user.id, organization_id=domain.organization_id)

    settings = get_settings()
    if domain.verified:
        return DomainVerifyResponse(verified=True, message="Already verified")

    ok = verify_challenge_txt_presence(
        domain.name,
        domain.verification_token,
        timeout=float(settings.dns_timeout_seconds),
    )
    if not ok:
        return DomainVerifyResponse(
            verified=False,
            message=(
                f"TXT record not found at _exposure-monitor.{domain.name} "
                f"with the expected verification value."
            ),
        )

    domain.verified = True
    return DomainVerifyResponse(verified=True, message="Domain verified")


@router.post(
    "/{domain_id}/scan",
    response_model=DomainScanResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def enqueue_domain_scan(
    domain_id: uuid.UUID,
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
    scan_type: ScanType = ScanType.full,
) -> DomainScanResponse:
    domain = db.get(Domain, domain_id)
    if domain is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    _ = require_membership(db, user_id=user.id, organization_id=domain.organization_id)

    if not domain.verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain must be verified before scanning",
        )

    existing = db.execute(
        select(Scan.id).where(
            Scan.domain_id == domain.id,
            Scan.scan_type == scan_type,
            Scan.status.in_([ScanStatus.queued, ScanStatus.running]),
        ),
    ).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A scan of this type is already queued or running for this domain",
        )

    scan = Scan(
        organization_id=domain.organization_id,
        domain_id=domain.id,
        scan_type=scan_type,
        status=ScanStatus.queued,
    )
    db.add(scan)
    db.flush()
    return DomainScanResponse(scan_id=scan.id, status=scan.status.value)
