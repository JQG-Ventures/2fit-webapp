"""Branch tests for legacy muscle tag expansion (used by muscle sync)."""

from __future__ import annotations

from app.constants.muscle_taxonomy import expand_legacy_muscle_tags


def test_expand_maps_legacy_string_with_spaces() -> None:
    out = expand_legacy_muscle_tags(["chest"])
    assert "upper_chest" in out
    assert "lower_chest" in out


def test_expand_tries_space_underscore_hyphen_variants() -> None:
    out = expand_legacy_muscle_tags(["hip flexors"])
    assert "quadriceps" in out
    assert "abs" in out


def test_expand_unknown_falls_back_to_direct_code_if_in_v1() -> None:
    out = expand_legacy_muscle_tags(["biceps"])
    assert out == frozenset({"biceps"})


def test_expand_unknown_skips_when_not_in_v1() -> None:
    out = expand_legacy_muscle_tags(["totally_unknown_muscle_xyz"])
    assert out == frozenset()


def test_expand_direct_canonical_code_without_legacy_match() -> None:
    """Covers the ``for ... else`` branch that adds ``key_underscore`` when it is in ``MUSCLE_CODES_V1``."""
    out = expand_legacy_muscle_tags(["lats"])
    assert out == frozenset({"lats"})


def test_expand_strips_and_lowercases() -> None:
    out = expand_legacy_muscle_tags(["  BICEPS  "])
    assert out == frozenset({"biceps"})
