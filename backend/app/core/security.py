"""Firebase ID token verification (authentication only).

Authorization for organizations is enforced separately via membership checks.
"""

from __future__ import annotations

import logging
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials
from firebase_admin.exceptions import FirebaseError

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)

_app_initialized = False


def init_firebase(settings: Settings | None = None) -> None:
    global _app_initialized
    if _app_initialized:
        return
    settings = settings or get_settings()
    if firebase_admin._apps:
        _app_initialized = True
        return
    cred_path = settings.firebase_credentials_path
    if cred_path:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Application Default Credentials (e.g. GOOGLE_APPLICATION_CREDENTIALS).
        firebase_admin.initialize_app()
    _app_initialized = True
    logger.info(
        "firebase_admin_initialized",
        extra={"credential_source": "file" if cred_path else "application_default"},
    )


def verify_firebase_id_token(
    raw_token: str, settings: Settings | None = None
) -> dict[str, Any]:
    """Verify JWT and return decoded claims."""

    settings = settings or get_settings()
    init_firebase(settings)
    decoded: dict[str, Any] = auth.verify_id_token(
        raw_token,
        check_revoked=(settings.env == "production"),
    )
    aud = decoded.get("aud")
    allowed = settings.firebase_audience_list
    if allowed and aud not in allowed:
        logger.warning("firebase_token_rejected_audience", extra={"aud": aud})
        raise PermissionError("Token audience not allowed.")
    return decoded


def verify_firebase_id_token_optional(
    raw_token: str | None,
    *,
    settings: Settings | None = None,
) -> dict[str, Any] | None:
    if raw_token is None:
        return None
    try:
        return verify_firebase_id_token(raw_token, settings)
    except (ValueError, FirebaseError, PermissionError) as e:
        logger.warning(
            "firebase_token_verify_failed", extra={"error_type": type(e).__name__}
        )
        return None
