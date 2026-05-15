import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.services.authorization import require_membership


def test_require_membership_raises_when_missing():
    db = MagicMock()
    db.execute.return_value.scalar_one_or_none.return_value = None

    with pytest.raises(HTTPException) as exc:
        require_membership(
            db,
            user_id=uuid.uuid4(),
            organization_id=uuid.uuid4(),
        )
    assert exc.value.status_code == 403


def test_require_membership_returns_row():
    db = MagicMock()
    member = SimpleNamespace(role="owner")
    db.execute.return_value.scalar_one_or_none.return_value = member

    out = require_membership(
        db,
        user_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
    )
    assert out is member
