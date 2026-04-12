"""Canonical muscle taxonomy v1 — stable codes; English `name` for admin/logs; UI translates by `code` via i18n."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final, Literal

BodyRegion = Literal["upper", "lower", "core"]
VisualCluster = Literal["chest", "back", "shoulders", "arms", "core", "legs"]
MuscleRole = Literal["primary", "secondary"]


@dataclass(frozen=True, slots=True)
class MuscleDefinition:
    code: str
    name: str  # English base label (DB); user-facing copy lives in frontend locales keyed by `code`
    body_region: BodyRegion
    visual_cluster: VisualCluster
    heatmap_slot: str
    sort_order: int


# ~20 muscles — medium granularity; aligns with muscle-taxonomy-v1.md
MUSCLES_V1: Final[tuple[MuscleDefinition, ...]] = (
    MuscleDefinition("upper_chest", "Upper chest", "upper", "chest", "upper_chest", 10),
    MuscleDefinition("lower_chest", "Lower chest", "upper", "chest", "lower_chest", 15),
    MuscleDefinition("upper_back", "Upper back", "upper", "back", "upper_back", 20),
    MuscleDefinition("lats", "Lats", "upper", "back", "lats", 30),
    MuscleDefinition("mid_back", "Mid back", "upper", "back", "mid_back", 40),
    MuscleDefinition("lower_back", "Lower back", "upper", "back", "lower_back", 50),
    MuscleDefinition(
        "deltoid_anterior", "Front deltoid", "upper", "shoulders", "deltoid_front", 60
    ),
    MuscleDefinition("deltoid_lateral", "Side deltoid", "upper", "shoulders", "deltoid_side", 70),
    MuscleDefinition("deltoid_posterior", "Rear deltoid", "upper", "shoulders", "deltoid_rear", 80),
    MuscleDefinition("biceps", "Biceps", "upper", "arms", "biceps", 90),
    MuscleDefinition("triceps", "Triceps", "upper", "arms", "triceps", 100),
    MuscleDefinition("forearms", "Forearms", "upper", "arms", "forearms", 110),
    MuscleDefinition("quadriceps", "Quadriceps", "lower", "legs", "quadriceps", 120),
    MuscleDefinition("hamstrings", "Hamstrings", "lower", "legs", "hamstrings", 130),
    MuscleDefinition("glutes", "Glutes", "lower", "legs", "glutes", 140),
    MuscleDefinition("adductors", "Adductors", "lower", "legs", "adductors", 145),
    MuscleDefinition("calves", "Calves", "lower", "legs", "calves", 150),
    MuscleDefinition("shins", "Shins", "lower", "legs", "shins", 155),
    MuscleDefinition("abs", "Abs", "core", "core", "abs", 160),
    MuscleDefinition("obliques", "Obliques", "core", "core", "obliques", 170),
)

MUSCLE_CODES_V1: Final[frozenset[str]] = frozenset(m.code for m in MUSCLES_V1)

# Legacy seed strings -> canonical codes (exercises.muscle_group until fully migrated)
LEGACY_MUSCLE_STRING_TO_CODES: Final[dict[str, tuple[str, ...]]] = {
    "chest": ("upper_chest", "lower_chest"),
    "upper-chest": ("upper_chest",),
    "upper_chest": ("upper_chest",),
    "upper chest": ("upper_chest",),
    "lower-chest": ("lower_chest",),
    "lower_chest": ("lower_chest",),
    "lower chest": ("lower_chest",),
    "shoulders": ("deltoid_anterior", "deltoid_lateral", "deltoid_posterior"),
    "back": ("mid_back", "lats", "upper_back"),
    "upper_back": ("upper_back",),
    "upper back": ("upper_back",),
    "lower_back": ("lower_back",),
    "lower back": ("lower_back",),
    "lower-back": ("lower_back",),
    "trapezius": ("upper_back",),
    "lats": ("lats",),
    "arms": ("biceps", "triceps"),
    "biceps": ("biceps",),
    "triceps": ("triceps",),
    "forearms": ("forearms",),
    "core": ("abs", "obliques"),
    "legs": ("quadriceps", "hamstrings", "glutes", "calves", "adductors", "shins"),
    "glutes": ("glutes",),
    "quadricep": ("quadriceps",),
    "quads": ("quadriceps",),
    "quadriceps": ("quadriceps",),
    "hamstrings": ("hamstrings",),
    "calves": ("calves",),
    "adductors": ("adductors",),
    "inner thighs": ("adductors",),
    "inner_thighs": ("adductors",),
    "shins": ("shins",),
    "tibialis": ("shins",),
    "obliques": ("obliques",),
    "abs": ("abs",),
    "full body": (
        "upper_chest",
        "lower_chest",
        "lats",
        "quadriceps",
        "abs",
        "deltoid_lateral",
        "hamstrings",
    ),
    "full_body": (
        "upper_chest",
        "lower_chest",
        "lats",
        "quadriceps",
        "abs",
        "deltoid_lateral",
        "hamstrings",
    ),
    "hip flexors": ("quadriceps", "abs"),
    "hip_flexors": ("quadriceps", "abs"),
    "piriformis": ("glutes",),
    "ankles": ("calves", "shins"),
    "wrists": ("forearms",),
    "neck": ("upper_back",),
    "hips": ("glutes", "adductors"),
}


def expand_legacy_muscle_tags(tags: list[str]) -> frozenset[str]:
    """Map free-form muscle_group[] from exercises to canonical codes."""
    out: set[str] = set()
    for raw in tags:
        key_space = raw.strip().lower()
        key_underscore = key_space.replace(" ", "_")
        key_hyphen = key_space.replace(" ", "-")
        for key in (key_space, key_underscore, key_hyphen):
            if key in LEGACY_MUSCLE_STRING_TO_CODES:
                out.update(LEGACY_MUSCLE_STRING_TO_CODES[key])
                break
        else:
            if key_underscore in MUSCLE_CODES_V1:
                out.add(key_underscore)
    return frozenset(out)
