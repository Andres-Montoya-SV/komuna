"""Monitored domain per organization."""

import secrets
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.dns_snapshot import DnsSnapshot
    from app.models.organization import Organization
    from app.models.scan import Scan


def new_verification_token() -> str:
    return secrets.token_urlsafe(32)


class Domain(Base):
    __tablename__ = "domains"
    __table_args__ = (UniqueConstraint("organization_id", "name", name="uq_org_domain_name"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(253), nullable=False, index=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_token: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship("Organization", back_populates="domains")
    assets: Mapped[list["Asset"]] = relationship("Asset", back_populates="domain")
    scans: Mapped[list["Scan"]] = relationship("Scan", back_populates="domain")
    dns_snapshots: Mapped[list["DnsSnapshot"]] = relationship(
        "DnsSnapshot",
        back_populates="domain",
    )
