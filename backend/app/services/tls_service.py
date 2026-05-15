"""TLS certificate metadata for defensive expiry monitoring."""

from __future__ import annotations

import logging
import socket
import ssl
from dataclasses import dataclass
from datetime import UTC, datetime

from cryptography import x509
from cryptography.hazmat.primitives.serialization import Encoding
from cryptography.x509.oid import ExtensionOID

from app.core.config import Settings, get_settings
from app.models.finding import FindingSeverity

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class TlsCertificateInfo:
    subject: str
    issuer: str
    not_before: datetime
    not_after: datetime
    san_dns_names: tuple[str, ...]
    pem_certificate: bytes

    def days_until_expiry(self, *, now: datetime | None = None) -> float:
        n = now if now is not None else datetime.now(UTC)
        if n.tzinfo is None:
            n = n.replace(tzinfo=UTC)
        return (self.not_after - n).total_seconds() / 86400.0

    def is_expired(self, *, now: datetime | None = None) -> bool:
        n = now if now is not None else datetime.now(UTC)
        if n.tzinfo is None:
            n = n.replace(tzinfo=UTC)
        return self.not_after < n

    def detected_self_signed(self) -> bool:
        """Best-effort: issuer subject matches certificate subject."""

        cert = x509.load_pem_x509_certificate(self.pem_certificate)
        return cert.issuer == cert.subject and len(cert.issuer) > 0


def _cert_validity_utc(cert_crypto: x509.Certificate) -> tuple[datetime, datetime]:
    try:
        nb = cert_crypto.not_valid_before_utc
        na = cert_crypto.not_valid_after_utc
        return nb, na
    except AttributeError:
        nb = cert_crypto.not_valid_before.replace(tzinfo=UTC)
        na = cert_crypto.not_valid_after.replace(tzinfo=UTC)
        return nb, na


def fetch_certificate(
    hostname: str,
    port: int = 443,
    *,
    settings: Settings | None = None,
    timeout: float | None = None,
) -> TlsCertificateInfo:
    settings = settings or get_settings()
    sock_timeout = float(timeout or settings.dns_timeout_seconds)

    ctx = ssl.create_default_context()
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED

    try:
        return _read_tls_certificate(
            hostname, port, sock_timeout=sock_timeout, ssl_context=ctx
        )
    except (ssl.SSLError, ssl.CertificateError, OSError) as e:
        logger.info(
            "tls_fallback_insecure_cert_read",
            extra={"hostname": hostname, "error_type": type(e).__name__},
        )

    insecure = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    insecure.minimum_version = ssl.TLSVersion.TLSv1_2
    insecure.check_hostname = False
    insecure.verify_mode = ssl.CERT_NONE

    try:
        return _read_tls_certificate(
            hostname, port, sock_timeout=sock_timeout, ssl_context=insecure
        )
    except (ssl.SSLError, OSError) as e:
        logger.warning(
            "tls_failed_fully",
            extra={"hostname": hostname, "error_type": type(e).__name__},
        )
        raise


def _read_tls_certificate(
    hostname: str,
    port: int,
    *,
    sock_timeout: float,
    ssl_context: ssl.SSLContext,
) -> TlsCertificateInfo:
    with socket.create_connection((hostname, port), timeout=sock_timeout) as raw_sock:
        with ssl_context.wrap_socket(raw_sock, server_hostname=hostname) as ssock:
            pem_der = ssock.getpeercert(binary_form=True)
            if pem_der is None:
                raise ssl.SSLError("no_peer_certificate")

            cert_crypto = x509.load_der_x509_certificate(pem_der)
            pem = cert_crypto.public_bytes(Encoding.PEM)
            subject = cert_crypto.subject.rfc4514_string()
            issuer = cert_crypto.issuer.rfc4514_string()
            nb, na = _cert_validity_utc(cert_crypto)

            ext_sans: list[str] = []
            try:
                san_ext = cert_crypto.extensions.get_extension_for_oid(
                    ExtensionOID.SUBJECT_ALTERNATIVE_NAME,
                )
                for n in san_ext.value:
                    if isinstance(n, x509.DNSName):
                        ext_sans.append(n.value)
            except x509.ExtensionNotFound:
                pass

            return TlsCertificateInfo(
                subject=subject,
                issuer=issuer,
                not_before=nb,
                not_after=na,
                san_dns_names=tuple(sorted(ext_sans)),
                pem_certificate=pem,
            )


def severity_for_expiry_and_trust(
    *,
    days_left: float | None,
    expired: bool,
    self_signed: bool,
) -> tuple[FindingSeverity | None, str | None]:
    """Return (severity, reason_key) for certificate risk (defensive only)."""

    if expired:
        return FindingSeverity.critical, "expired"
    if days_left is not None:
        if days_left <= 0:
            return FindingSeverity.critical, "expired"
        if days_left <= 7:
            return FindingSeverity.high, "expires_within_7_days"
        if days_left <= 30:
            return FindingSeverity.medium, "expires_within_30_days"
    if self_signed:
        return FindingSeverity.medium, "self_signed"
    return None, None
