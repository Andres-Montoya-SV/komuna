from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.finding import FindingSeverity, FindingStatus


class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    asset_id: UUID | None
    severity: FindingSeverity
    status: FindingStatus
    title: str
    description: str
    impact: str
    recommendation: str
    evidence: dict[str, Any]
    detected_at: datetime
    updated_at: datetime


class FindingStatusUpdate(BaseModel):
    status: FindingStatus
