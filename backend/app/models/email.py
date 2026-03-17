from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Email(BaseModel):
    __tablename__ = "emails"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
