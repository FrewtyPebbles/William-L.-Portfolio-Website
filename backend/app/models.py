import datetime

from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    google_id:Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email:Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name:Mapped[str] = mapped_column(String)
    avatar_url:Mapped[str] = mapped_column(String)

    comments:Mapped[list["Comment"]] = relationship("Comment", back_populates="user")



class Comment(Base):
    __tablename__ = "comments"

    id:Mapped[int] = mapped_column(Integer, primary_key=True)

    content:Mapped[str] = mapped_column(String(1000), nullable=False)

    created_at:Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now)

    user_id:Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    project_slug:Mapped[str] = mapped_column(String(50), nullable=False)

    # NEW
    parent_id:Mapped[int] = mapped_column(
        Integer,
        ForeignKey("comments.id"),
        nullable=True
    )

    user:Mapped["User"] = relationship("User", back_populates="comments")

    replies:Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete-orphan"
    )

    parent:Mapped["Comment"] = relationship(
        "Comment",
        remote_side=[id],
        back_populates="replies"
    )