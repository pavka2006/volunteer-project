from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from ..models.user import UserType, ItemType


# Схемы для регистрации
class UserRegister(BaseModel):
    user_type: UserType
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    organization_name: Optional[str] = None
    city: str


# Схемы для входа
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Схема для смены email
class EmailChangeRequest(BaseModel):
    new_email: EmailStr
    password: str  # Подтверждение пароля


# Схема токена
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Схема ответа пользователя (без пароля)
class UserResponse(BaseModel):
    id: int
    user_type: UserType
    email: EmailStr
    full_name: str
    organization_name: Optional[str] = None
    city: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: bool
    is_banned: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Схема для администратора (полная информация)
class UserDetailResponse(BaseModel):
    id: int
    user_type: UserType
    email: EmailStr
    full_name: str
    organization_name: Optional[str] = None
    city: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: bool
    is_banned: bool
    created_at: datetime
    updated_at: Optional[datetime] = None  # ИСПРАВЛЕНО - может быть None

    class Config:
        from_attributes = True


# Схема для обновления профиля
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    organization_name: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None


# Схема для назначения модератора
class MakeModeratorRequest(BaseModel):
    user_id: int


# Схема для удаления модератора
class RemoveModeratorRequest(BaseModel):
    user_id: int


# Схема для бана пользователя
class BanUserRequest(BaseModel):
    user_id: int
    reason: Optional[str] = None


# Схемы для избранного
class FavoriteCreate(BaseModel):
    item_type: ItemType
    item_id: int


class FavoriteResponse(BaseModel):
    id: int
    item_type: ItemType
    item_id: int
    added_at: datetime

    class Config:
        from_attributes = True
