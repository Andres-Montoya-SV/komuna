from app.models.finding import FindingSeverity
from app.services.tls_service import severity_for_expiry_and_trust


def test_expired_critical():
    severity, reason = severity_for_expiry_and_trust(
        days_left=-1.0, expired=True, self_signed=False
    )
    assert reason == "expired"
    assert severity == FindingSeverity.critical


def test_seven_days_high():
    severity, reason = severity_for_expiry_and_trust(
        days_left=6.0, expired=False, self_signed=False
    )
    assert reason == "expires_within_7_days"
    assert severity == FindingSeverity.high


def test_thirty_days_medium():
    severity, reason = severity_for_expiry_and_trust(
        days_left=29.0, expired=False, self_signed=False
    )
    assert reason == "expires_within_30_days"
    assert severity == FindingSeverity.medium


def test_self_signed_medium_when_no_expiry_issue():
    severity, reason = severity_for_expiry_and_trust(
        days_left=90.0, expired=False, self_signed=True
    )
    assert reason == "self_signed"
    assert severity == FindingSeverity.medium
