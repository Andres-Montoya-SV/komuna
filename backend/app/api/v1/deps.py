"""Shared dependencies (auth + DB)."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import verify_firebase_id_token
from app.db.session import get_session
from app.models.user import User


async def bearer_token_from_header(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> str:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token"
        )
    return token


async def firebase_claims(
    token: Annotated[str, Depends(bearer_token_from_header)]
) -> dict:
    try:
        return verify_firebase_id_token(token)
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Token not permitted"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid ID token"
        )


def current_user(
    db: Annotated[Session, Depends(get_session)],
    claims: Annotated[dict, Depends(firebase_claims)],
) -> User:
    uid = claims.get("uid")
    if not isinstance(uid, str) or not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token claims"
        )

    email = claims.get("email")
    if not isinstance(email, str) or not email.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Email claim required"
        )

    name = claims.get("name") if isinstance(claims.get("name"), str) else None

    stmt = select(User).where(User.firebase_uid == uid)
    existing = db.execute(stmt).scalar_one_or_none()
    if existing:
        changed = False
        if existing.email != email.strip():
            existing.email = email.strip()
            changed = True
        if name is not None and existing.name != name:
            existing.name = name
            changed = True
        _ = changed
        return existing

    user = User(firebase_uid=uid, email=email.strip(), name=name)
    db.add(user)
    db.flush()
    return user
