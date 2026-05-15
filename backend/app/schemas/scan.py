from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.scan import ScanStatus, ScanType


class ScanCreateRequest(BaseModel):
    scan_type: ScanType


class ScanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    domain_id: UUID | None
    scan_type: ScanType
    status: ScanStatus
    result_summary: dict[str, Any] | None
    started_at: datetime | None
    finished_at: datetime | None
    created_at: datetime
