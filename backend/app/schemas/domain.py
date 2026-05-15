from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DomainCreate(BaseModel):
    organization_id: UUID
    name: str = Field(..., min_length=3, max_length=253)


class DomainOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    name: str
    verified: bool
    created_at: datetime
    updated_at: datetime


class DomainVerifyResponse(BaseModel):
    verified: bool
    message: str


class DomainScanResponse(BaseModel):
    scan_id: UUID
    status: str
