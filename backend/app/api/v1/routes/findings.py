from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import current_user
from app.db.session import get_session
from app.models.finding import Finding
from app.models.user import User
from app.schemas.finding import FindingOut, FindingStatusUpdate
from app.services.authorization import require_membership

router = APIRouter(prefix="/findings", tags=["findings"])


@router.get("", response_model=list[FindingOut])
def list_findings(
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
    organization_id: Annotated[uuid.UUID, Query()],
) -> list[Finding]:
    _ = require_membership(db, user_id=user.id, organization_id=organization_id)
    stmt = (
        select(Finding)
        .where(Finding.organization_id == organization_id)
        .order_by(Finding.detected_at.desc())
    )
    return list(db.execute(stmt).scalars().unique().all())


@router.patch("/{finding_id}/status", response_model=FindingOut)
def update_finding_status(
    finding_id: uuid.UUID,
    payload: FindingStatusUpdate,
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
) -> Finding:
    finding = db.get(Finding, finding_id)
    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found"
        )
    _ = require_membership(db, user_id=user.id, organization_id=finding.organization_id)
    finding.status = payload.status
    return finding
