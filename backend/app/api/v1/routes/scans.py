from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import current_user
from app.db.session import get_session
from app.models.scan import Scan
from app.models.user import User
from app.schemas.scan import ScanOut
from app.services.authorization import require_membership

router = APIRouter(prefix="/scans", tags=["scans"])


@router.get("", response_model=list[ScanOut])
def list_scans(
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
    organization_id: Annotated[uuid.UUID, Query()],
) -> list[Scan]:
    _ = require_membership(db, user_id=user.id, organization_id=organization_id)
    stmt = (
        select(Scan)
        .where(Scan.organization_id == organization_id)
        .order_by(Scan.created_at.desc())
    )
    return list(db.execute(stmt).scalars().unique().all())


@router.get("/{scan_id}", response_model=ScanOut)
def get_scan(
    scan_id: uuid.UUID,
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
) -> Scan:
    scan = db.get(Scan, scan_id)
    if scan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found"
        )
    _ = require_membership(db, user_id=user.id, organization_id=scan.organization_id)
    return scan
