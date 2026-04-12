"""Aggregated workout plan + challenge cards for home discovery (explore + by-level)."""

from __future__ import annotations

import random
from typing import Any, Literal

from sqlalchemy import func, select

from app.extensions import db
from app.models.challenge import Challenge, ChallengeDay, ChallengeDayExercise
from app.models.workout_plan import WorkoutDay, WorkoutDayExercise, WorkoutPlan

LevelFilter = Literal["all", "beginner", "intermediate", "advanced"]


def _wde_estimated_seconds() -> Any:
    return WorkoutDayExercise.sets * func.greatest(
        WorkoutDayExercise.reps, 1
    ) * 2 + WorkoutDayExercise.rest_seconds * func.greatest(WorkoutDayExercise.sets - 1, 0)


def _cde_estimated_seconds() -> Any:
    return ChallengeDayExercise.sets * func.greatest(
        ChallengeDayExercise.reps, 1
    ) * 2 + ChallengeDayExercise.rest_seconds * func.greatest(ChallengeDayExercise.sets - 1, 0)


def _fetch_workout_plan_cards() -> list[dict[str, Any]]:
    stmt = (
        select(
            WorkoutPlan.id,
            WorkoutPlan.name,
            WorkoutPlan.description,
            WorkoutPlan.image_url,
            WorkoutPlan.level,
            WorkoutPlan.plan_type,
            func.count(func.distinct(WorkoutDay.id)).label("day_count"),
            func.count(WorkoutDayExercise.id).label("exercise_count"),
            func.coalesce(func.sum(_wde_estimated_seconds()), 0).label("est_seconds"),
        )
        .join(WorkoutDay, WorkoutDay.workout_plan_id == WorkoutPlan.id)
        .join(WorkoutDayExercise, WorkoutDayExercise.workout_day_id == WorkoutDay.id)
        .where(
            WorkoutPlan.is_active.is_(True),
            WorkoutPlan.plan_type.in_(("library", "paid")),
        )
        .group_by(WorkoutPlan.id)
    )
    rows = db.session.execute(stmt).all()
    out: list[dict[str, Any]] = []
    for r in rows:
        est_min = max(1, int(round((r.est_seconds or 0) / 60)))
        out.append(
            {
                "id": str(r.id),
                "card_type": "workout_plan",
                "title": r.name,
                "description": r.description or "",
                "image_url": r.image_url or "",
                "level": r.level,
                "plan_type": r.plan_type,
                "estimated_minutes": est_min,
                "day_count": int(r.day_count or 0),
                "exercise_count": int(r.exercise_count or 0),
            }
        )
    return out


def _fetch_challenge_cards() -> list[dict[str, Any]]:
    stmt = (
        select(
            Challenge.id,
            Challenge.name,
            Challenge.description,
            Challenge.image_url,
            Challenge.level,
            Challenge.plan_type,
            func.count(func.distinct(ChallengeDay.id)).label("day_count"),
            func.count(ChallengeDayExercise.id).label("exercise_count"),
            func.coalesce(func.sum(_cde_estimated_seconds()), 0).label("est_seconds"),
        )
        .join(ChallengeDay, ChallengeDay.challenge_id == Challenge.id)
        .join(ChallengeDayExercise, ChallengeDayExercise.challenge_day_id == ChallengeDay.id)
        .where(Challenge.is_active.is_(True))
        .group_by(Challenge.id)
    )
    rows = db.session.execute(stmt).all()
    out: list[dict[str, Any]] = []
    for r in rows:
        est_min = max(1, int(round((r.est_seconds or 0) / 60)))
        out.append(
            {
                "id": str(r.id),
                "card_type": "challenge",
                "title": r.name,
                "description": r.description or "",
                "image_url": r.image_url or "",
                "level": r.level,
                "plan_type": r.plan_type,
                "estimated_minutes": est_min,
                "day_count": int(r.day_count or 0),
                "exercise_count": int(r.exercise_count or 0),
            }
        )
    return out


def get_all_home_cards() -> list[dict[str, Any]]:
    return _fetch_workout_plan_cards() + _fetch_challenge_cards()


def get_explore_cards(limit: int) -> list[dict[str, Any]]:
    cards = get_all_home_cards()
    if not cards:
        return []
    random.shuffle(cards)
    return cards[: min(limit, len(cards))]


def get_by_level_cards(level: LevelFilter, limit: int) -> list[dict[str, Any]]:
    cards = get_all_home_cards()
    if not cards:
        return []
    if level != "all":
        cards = [c for c in cards if c["level"] == level]
    if not cards:
        return []
    random.shuffle(cards)
    return cards[: min(limit, len(cards))]
