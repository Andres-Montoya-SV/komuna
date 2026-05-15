from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.asset import AssetType


class AssetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    domain_id: UUID | None
    asset_type: AssetType
    value: str
    metadata_json: dict[str, Any] | None
    first_seen_at: datetime
    last_seen_at: datetime
