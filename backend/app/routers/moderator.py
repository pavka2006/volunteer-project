from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth.jwt_handler import get_current_active_user
from ..models.user import User, UserType

router = APIRouter(prefix="/api/moderator", tags=["Moderator"])


def check_moderator(current_user: User):
    """Проверка, что пользователь - модератор или выше"""
    if current_user.user_type not in [UserType.moderator, UserType.admin]:
        raise HTTPException(
            status_code=403,
            detail="Доступ только для модераторов и администраторов"
        )
    return current_user


@router.get("/dashboard")
def get_dashboard(
        current_user: User = Depends(get_current_active_user)
):
    """Получить информацию модератора"""
    check_moderator(current_user)

    return {
        "message": f"Добро пожаловать, {current_user.full_name}!",
        "role": current_user.user_type.value,
        "permissions": [
            "moderate_news",
            "moderate_events",
            "ban_users" if current_user.user_type == UserType.admin else None
        ]
    }

# Здесь будут эндпоинты для модерации новостей, событий и т.д.
# Они будут добавлены позже при реализации остальных разделов сайта
