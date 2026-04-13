"""Helpers for PostgreSQL-backed integration tests."""

from __future__ import annotations

from sqlalchemy import text

from app.extensions import db


def truncate_all_tables() -> None:
    """Remove all rows from every mapped table (keeps schema). Uses TRUNCATE CASCADE."""
    table_names = [f'"{t.name}"' for t in db.metadata.sorted_tables]
    if not table_names:
        return
    stmt = text(f"TRUNCATE {', '.join(table_names)} RESTART IDENTITY CASCADE")
    db.session.execute(stmt)
    db.session.commit()
