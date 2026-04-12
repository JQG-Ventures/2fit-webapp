"""Muscle taxonomy persistence and legacy muscle_group → exercise_muscles sync."""

from __future__ import annotations

import uuid
from typing import Any

from flask_sqlalchemy.session import Session as FlaskSession
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, scoped_session

from app.constants.muscle_taxonomy import MUSCLE_CODES_V1, MUSCLES_V1, expand_legacy_muscle_tags
from app.extensions import db
from app.models.exercise import Exercise
from app.models.muscle import ExerciseMuscle, Muscle


def ensure_muscles_seeded(session: Session | None = None) -> int:
    """Upsert canonical muscles from MUSCLES_V1. Returns count of rows touched."""
    sess = session or db.session
    touched = 0
    for m in MUSCLES_V1:
        existing = sess.scalars(select(Muscle).where(Muscle.code == m.code)).first()
        if existing:
            existing.name = m.name
            existing.body_region = m.body_region
            existing.visual_cluster = m.visual_cluster
            existing.heatmap_slot = m.heatmap_slot
            existing.sort_order = m.sort_order
        else:
            sess.add(
                Muscle(
                    code=m.code,
                    name=m.name,
                    body_region=m.body_region,
                    visual_cluster=m.visual_cluster,
                    heatmap_slot=m.heatmap_slot,
                    sort_order=m.sort_order,
                )
            )
        touched += 1

    stale_ids = list(
        sess.scalars(select(Muscle).where(Muscle.code.not_in(list(MUSCLE_CODES_V1)))).all()
    )
    for row in stale_ids:
        sess.delete(row)

    sess.flush()
    return touched


def _muscle_ids_by_code(sess: Session | scoped_session[FlaskSession]) -> dict[str, uuid.UUID]:
    rows = sess.scalars(select(Muscle)).all()
    return {r.code: r.id for r in rows}


def sync_exercise_muscle_links_from_legacy(session: Session | None = None) -> int:
    """
    Rebuild exercise_muscles from exercises.muscle_group using LEGACY_MUSCLE_STRING_TO_CODES.
    Idempotent per exercise.
    """
    sess = session or db.session
    code_to_id = _muscle_ids_by_code(sess)
    if not code_to_id:
        return 0

    exercises = list(sess.scalars(select(Exercise)).all())
    linked = 0
    for ex in exercises:
        sess.execute(delete(ExerciseMuscle).where(ExerciseMuscle.exercise_id == ex.id))
        codes = expand_legacy_muscle_tags(ex.muscle_group)
        if not codes:
            continue
        for i, code in enumerate(sorted(codes)):
            mid = code_to_id.get(code)
            if not mid:
                continue
            role = "primary" if i == 0 else "secondary"
            sess.add(
                ExerciseMuscle(
                    exercise_id=ex.id,
                    muscle_id=mid,
                    role=role,
                )
            )
            linked += 1
    sess.flush()
    return linked


def list_muscles_ordered(session: Session | None = None) -> list[Muscle]:
    sess = session or db.session
    stmt = select(Muscle).order_by(Muscle.sort_order, Muscle.code)
    return list(sess.scalars(stmt).all())


def muscle_to_dict(m: Muscle) -> dict[str, Any]:
    return {
        "_id": str(m.id),
        "code": m.code,
        "name": m.name,
        "body_region": m.body_region,
        "visual_cluster": m.visual_cluster,
        "heatmap_slot": m.heatmap_slot,
        "sort_order": m.sort_order,
    }
