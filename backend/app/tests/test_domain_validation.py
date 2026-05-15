from app.services import dns_service
from app.services.domain_validation import (
    assert_domain_allowed_for_operations,
    is_disallowed_hostname,
    normalize_domain,
    resolved_addresses_are_safe,
    verify_challenge_txt_presence,
)


def test_normalize_domain_lowercases_and_idna():
    assert normalize_domain("Example.COM") == "example.com"


def test_normalize_domain_rejects_empty():
    try:
        normalize_domain("   ")
    except ValueError:
        return
    raise AssertionError("expected ValueError")


def test_localhost_rejected():
    assert is_disallowed_hostname("localhost") == "localhost is not permitted"


def test_private_ip_literal_rejected_message():
    reason = is_disallowed_hostname("127.0.0.1")
    assert isinstance(reason, str)


def test_assert_operations_raises_on_localhost():
    try:
        assert_domain_allowed_for_operations("localhost")
    except ValueError:
        return
    raise AssertionError("expected ValueError")


def test_verify_challenge(monkeypatch):
    def fake_collect_rrset(hostname: str, rtype: str, *, timeout: float):
        assert rtype == "TXT"
        assert hostname.startswith("_exposure-monitor.")
        return ['"abc123"']

    monkeypatch.setattr("app.services.dns_service.collect_rrset", fake_collect_rrset)
    ok = verify_challenge_txt_presence(
        "example.com",
        "abc123",
        timeout=2.0,
    )
    assert ok is True


def test_fingerprint_records_stable():
    fp1 = dns_service.fingerprint_records(["b", "a"])
    fp2 = dns_service.fingerprint_records(["  a ", "b"])
    assert fp1 == fp2


def test_snapshot_changed_semantics():
    assert dns_service.snapshot_changed(None, "x") is False
    assert dns_service.snapshot_changed("x", "x") is False
    assert dns_service.snapshot_changed("x", "y") is True


def test_resolved_addresses_reject_private_loopback(monkeypatch):
    class _R:
        def __init__(self, ip: str):
            self.address = ip

    class _Ans:
        def __init__(self, ip: str):
            self._ip = ip

        def __iter__(self):
            return iter([_R(self._ip)])

    class FakeResolver:
        lifetime = 0

        def resolve(self, hostname, rtype):  # noqa: ANN001
            _ = hostname, rtype
            return _Ans("127.0.0.1")

    monkeypatch.setattr(
        "app.services.domain_validation.dns.resolver.Resolver", lambda: FakeResolver()
    )
    ok, reason = resolved_addresses_are_safe("example.com", timeout=2.0)
    assert ok is False
    assert "unsafe" in reason
