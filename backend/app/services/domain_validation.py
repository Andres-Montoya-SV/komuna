"""Domain normalization and outbound-safety guards (no offensive probing)."""

from __future__ import annotations

import ipaddress
import re
from typing import Iterable

import dns.resolver
from dns.exception import DNSException


_LABEL_LDH_RE = re.compile(r"^(?!-)[a-z0-9_-]{1,63}(?<!-)$")


def normalize_domain(name: str) -> str:
    """Normalize user-supplied hostname: lowercase, strip, trailing dot removal, punycode per label."""
    s = name.strip().lower().rstrip(".")
    if not s:
        raise ValueError("Domain name cannot be empty")
    labels = [p for p in s.split(".") if p != ""]
    if not labels:
        raise ValueError("Domain name cannot be empty")
    ascii_labels: list[str] = []
    for label in labels:
        ascii_labels.append(label.encode("idna").decode("ascii"))
    return ".".join(ascii_labels)


def verification_txt_hostname(apex_ascii: str) -> str:
    return f"_exposure-monitor.{apex_ascii.strip().lower().rstrip('.')}"


def verify_challenge_txt_presence(
    apex_ascii: str,
    expected_token: str,
    *,
    timeout: float = 10.0,
) -> bool:
    """Check DNS TXT presence for `_exposure-monitor.<domain>` (defensive; no spoofing assertions)."""

    from app.services.dns_service import collect_rrset

    fqdn = normalize_domain(f"_exposure-monitor.{apex_ascii}")
    txs = collect_rrset(fqdn, "TXT", timeout=timeout)
    for txt in txs:
        if txt == expected_token:
            return True
        # Some resolvers concatenate chunks; tolerate quotes.
        condensed = "".join(part.strip('"') for part in txt.replace('" "', "").split('"') if part)
        condensed = condensed.replace(" ", "").strip("\"")
        if condensed == expected_token:
            return True
    return False


def _hostname_format_ok(host: str) -> bool:
    host = host.rstrip(".").strip().lower()
    if len(host) > 253:
        return False
    labels = host.split(".")
    if len(labels) < 2:
        return False
    return all(bool(_LABEL_LDH_RE.fullmatch(label)) for label in labels)


def is_ip_literal(host: str) -> bool:
    try:
        ipaddress.ip_address(host)
        return True
    except ValueError:
        return False


def is_disallowed_hostname(host_normalized: str) -> bool | str:
    """Return True if hostname is acceptable; otherwise return human-readable denial reason."""

    host = host_normalized.strip().lower()
    if host in {"localhost"} or host.endswith(".localhost"):
        return "localhost is not permitted"
    if host.endswith(".local"):
        return ".local domains are not permitted"
    if host.startswith("."):
        return "hostname cannot begin with '.'"
    if is_ip_literal(host):
        ipa = ipaddress.ip_address(host)
        if ipa.is_loopback or ipa.is_private or ipa.is_link_local or ipa.is_reserved:
            return "IP literal resolves to loopback/private/reserved"
        # Public IP literals are still disallowed for registration to avoid unintended scans.
        return "IP literals are not permitted as registered domains"

    stripped = host.strip("[]")
    if ":" in host or ("[" in host and "]" in host):
        try:
            ipaddress.ip_address(stripped)
            return "IPv6 literals are not permitted as registered domains"
        except ValueError:
            pass

    if not _hostname_format_ok(host):
        return "invalid hostname format"
    return True


def assert_domain_allowed_for_operations(host_normalized: str) -> None:
    check = is_disallowed_hostname(host_normalized)
    if check is not True:
        raise ValueError(check if isinstance(check, str) else "invalid domain")


def _ip_is_unsafe_for_outbound(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return True
    return bool(
        addr.is_private
        or addr.is_loopback
        or addr.is_link_local
        or addr.is_reserved
        or addr.is_multicast
        or addr.is_unspecified
    )


def resolved_addresses_are_safe(hostname: str, *, timeout: float = 5.0) -> tuple[bool, str]:
    """
    Best-effort sync resolution: if any A/AAAA target is unsafe, refuse outbound checks.
    Returns (ok, reason).
    """
    resolver = dns.resolver.Resolver()
    resolver.lifetime = timeout
    found_any = False
    try:
        for rtype in ("A", "AAAA"):
            try:
                answers = resolver.resolve(hostname, rtype)
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers):
                continue
            except DNSException as e:
                return False, f"dns_error_{rtype}:{e.__class__.__name__}"
            for rdata in answers:
                found_any = True
                ip = getattr(rdata, "address", None) or str(rdata)
                if _ip_is_unsafe_for_outbound(ip):
                    return False, f"resolved_to_unsafe_ip:{ip}"
        if not found_any:
            return True, "no_a_or_aaaa"
        return True, "ok"
    except Exception as e:  # defensive
        return False, f"dns_resolution_failed:{e.__class__.__name__}"


def filter_safe_hosts(hostnames: Iterable[str]) -> list[str]:
    """Drop obviously unsafe host strings before passive inventory steps."""
    out: list[str] = []
    for h in hostnames:
        norm = h.strip().lower().rstrip(".")
        if is_disallowed_hostname(norm) is not True:
            continue
        out.append(norm)
    return out
