"""Organization-scoped authorization (backend-owned; never trust Firebase UID alone)."""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.organization import OrganizationMember, OrganizationRole

_ROLE_ORDER: dict[OrganizationRole, int] = {
    OrganizationRole.member: 1,
    OrganizationRole.admin: 2,
    OrganizationRole.owner: 3,
}


def get_membership(
    db: Session,
    *,
    user_id: uuid.UUID,
    organization_id: uuid.UUID,
) -> OrganizationMember | None:
    stmt = select(OrganizationMember).where(
        OrganizationMember.user_id == user_id,
        OrganizationMember.organization_id == organization_id,
    )
    return db.execute(stmt).scalar_one_or_none()


def require_membership(
    db: Session,
    *,
    user_id: uuid.UUID,
    organization_id: uuid.UUID,
) -> OrganizationMember:
    row = get_membership(db, user_id=user_id, organization_id=organization_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not an organization member"
        )
    return row


def require_minimum_role(
    db: Session,
    *,
    user_id: uuid.UUID,
    organization_id: uuid.UUID,
    minimum: OrganizationRole,
) -> OrganizationMember:
    membership = require_membership(
        db, user_id=user_id, organization_id=organization_id
    )
    if _ROLE_ORDER.get(membership.role, 0) < _ROLE_ORDER[minimum]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role"
        )
    return membership


def role_at_least(actual: OrganizationRole, minimum: OrganizationRole) -> bool:
    return _ROLE_ORDER.get(actual, 0) >= _ROLE_ORDER[minimum]
