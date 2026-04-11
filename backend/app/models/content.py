from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Content(BaseModel):
    __tablename__ = "contents"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=[])
    file_path: Mapped[str] = mapped_column(Text, nullable=False, default="")
    blob_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
