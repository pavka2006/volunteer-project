from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..database import Base


class UserType(enum.Enum):
    nko_member = "nko_member"
    volunteer = "volunteer"
    admin = "admin"
    moderator = "moderator"  # НОВОЕ


class ItemType(enum.Enum):
    news = "news"
    event = "event"
    nko = "nko"
    moderator = "moderator"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_type = Column(SQLEnum(UserType), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    organization_name = Column(String, nullable=True)  # Для НКО
    city = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)  # Новое - аватарка
    is_active = Column(Boolean, default=True)
    is_banned = Column(Boolean, default=False)  # НОВОЕ - для банов
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связь с избранным
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_type = Column(SQLEnum(ItemType), nullable=False)
    item_id = Column(Integer, nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связь с пользователем
    user = relationship("User", back_populates="favorites")