"""Unit tests for pure helpers in ``muscle_repository`` (no DB)."""

from __future__ import annotations

import uuid
from unittest.mock import MagicMock

from app.models.muscle import Muscle
from app.repositories.muscle_repository import _muscle_ids_by_code, muscle_to_dict


def test_muscle_ids_by_code_maps_codes_to_uuids() -> None:
    mid = uuid.uuid4()
    row = MagicMock()
    row.code = "biceps"
    row.id = mid
    sess = MagicMock()
    sess.scalars.return_value.all.return_value = [row]

    assert _muscle_ids_by_code(sess) == {"biceps": mid}


def test_muscle_to_dict_serializes_model() -> None:
    mid = uuid.uuid4()
    m = Muscle(
        code="triceps",
        name="Triceps",
        body_region="upper",
        visual_cluster="arms",
        heatmap_slot="triceps",
        sort_order=2,
    )
    m.id = mid

    d = muscle_to_dict(m)
    assert d == {
        "_id": str(mid),
        "code": "triceps",
        "name": "Triceps",
        "body_region": "upper",
        "visual_cluster": "arms",
        "heatmap_slot": "triceps",
        "sort_order": 2,
    }


def test_muscle_ids_empty_session_returns_empty_dict() -> None:
    sess = MagicMock()
    sess.scalars.return_value.all.return_value = []
    assert _muscle_ids_by_code(sess) == {}
