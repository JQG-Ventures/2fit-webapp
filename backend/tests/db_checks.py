"""Runtime checks for optional PostgreSQL (integration tests)."""

from __future__ import annotations

import os

from sqlalchemy import create_engine, text


def postgres_reachable() -> bool:
    url = os.environ.get("DATABASE_URL", "")
    if not url.startswith("postgresql"):
        return False
    try:
        eng = create_engine(url, pool_pre_ping=True)
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except OSError:
        return False
    except Exception:
        return False
