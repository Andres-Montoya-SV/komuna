from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import current_user
from app.db.session import get_session
from app.models.asset import Asset
from app.models.user import User
from app.schemas.asset import AssetOut
from app.services.authorization import require_membership

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=list[AssetOut])
def list_assets(
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
    organization_id: Annotated[uuid.UUID, Query()],
) -> list[Asset]:
    _ = require_membership(db, user_id=user.id, organization_id=organization_id)
    stmt = (
        select(Asset)
        .where(Asset.organization_id == organization_id)
        .order_by(Asset.last_seen_at.desc())
    )
    return list(db.execute(stmt).scalars().unique().all())
