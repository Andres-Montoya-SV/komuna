import uuid
from unittest.mock import MagicMock

from app.models.finding import FindingSeverity, FindingStatus
from app.services import finding_service


def test_create_finding_adds_model():
    db = MagicMock()
    org_id = uuid.uuid4()
    finding = finding_service.create_finding(
        db,
        organization_id=org_id,
        asset_id=None,
        severity=FindingSeverity.info,
        title="t",
        description="d",
        impact="i",
        recommendation="r",
        evidence={"k": "v"},
    )
    assert finding.status == FindingStatus.open
    assert finding.organization_id == org_id
    db.add.assert_called_once()
