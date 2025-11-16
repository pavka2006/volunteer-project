from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.user import UserResponse, UserUpdate, EmailChangeRequest
from ..crud import user as crud_user
from ..auth.jwt_handler import get_current_active_user
from ..models.user import User, UserType

router = APIRouter(prefix="/api/nko", tags=["NKO"])


def check_nko_member(current_user: User):
    """Проверка, что пользователь - член НКО"""
    if current_user.user_type != UserType.nko_member:
        raise HTTPException(
            status_code=403,
            detail="Доступ только для членов НКО"
        )
    return current_user


@router.get("/profile", response_model=UserResponse)
def get_nko_profile(
        current_user: User = Depends(get_current_active_user),
):
    """Получить профиль НКО"""
    check_nko_member(current_user)
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_nko_profile(
        profile_update: UserUpdate,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Обновить профиль НКО"""
    check_nko_member(current_user)

    updated_user = crud_user.update_user(db, current_user.id, profile_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return updated_user


@router.put("/avatar")
async def update_nko_avatar(
        photo_url: str,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Загрузить логотип НКО"""
    check_nko_member(current_user)

    updated_user = crud_user.update_user(
        db,
        current_user.id,
        UserUpdate(photo_url=photo_url)
    )

    if not updated_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return {"message": "Логотип обновлен", "photo_url": updated_user.photo_url}


@router.put("/email")
async def change_nko_email(
        email_change: "EmailChangeRequest",
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Изменить email НКО"""
    check_nko_member(current_user)

    result = crud_user.change_email(db, current_user.id, email_change.new_email, email_change.password)

    if result is False:
        raise HTTPException(status_code=401, detail="Неправильный пароль")

    if result == "email_exists":
        raise HTTPException(status_code=400, detail="Email уже используется")

    return {"message": "Email успешно изменён", "new_email": email_change.new_email}
