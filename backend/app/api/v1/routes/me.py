from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.v1.deps import current_user
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/me", tags=["users"])


@router.get("", response_model=UserOut)
def read_me(user: Annotated[User, Depends(current_user)]) -> User:
    return user
