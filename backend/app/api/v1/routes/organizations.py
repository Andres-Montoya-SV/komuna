from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import current_user
from app.db.session import get_session
from app.models.organization import (
    Organization,
    OrganizationMember,
    OrganizationRole,
    slugify_name,
)
from app.models.user import User
from app.schemas.organization import OrganizationCreate, OrganizationOut

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.post("", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
) -> Organization:
    base_slug = slugify_name(payload.name)
    slug = base_slug
    for _ in range(25):
        exists = db.execute(
            select(Organization).where(Organization.slug == slug)
        ).scalar_one_or_none()
        if exists is None:
            break
        slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"

    org = Organization(name=payload.name.strip(), slug=slug)
    db.add(org)
    db.flush()

    membership = OrganizationMember(
        organization_id=org.id,
        user_id=user.id,
        role=OrganizationRole.owner,
    )
    db.add(membership)
    return org


@router.get("", response_model=list[OrganizationOut])
def list_my_organizations(
    db: Annotated[Session, Depends(get_session)],
    user: Annotated[User, Depends(current_user)],
) -> list[Organization]:
    stmt = (
        select(Organization)
        .join(OrganizationMember, OrganizationMember.organization_id == Organization.id)
        .where(OrganizationMember.user_id == user.id)
        .order_by(Organization.created_at.asc())
    )
    return list(db.execute(stmt).scalars().unique().all())
