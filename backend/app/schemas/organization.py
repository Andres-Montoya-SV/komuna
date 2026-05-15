from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.organization import OrganizationRole


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=256)


class OrganizationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    created_at: datetime
    updated_at: datetime


class OrganizationMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    organization_id: UUID
    user_id: UUID
    role: OrganizationRole
    created_at: datetime
