from fastapi import APIRouter, Depends, HTTPException, status
import os
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..auth.jwt_handler import get_current_active_user
from ..crud import user as crud_user
from ..models.user import User, UserType
from ..schemas.user import UserResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])


def check_admin(current_user: User):
    """Проверка что пользователь админ"""
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуются права администратора")


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
        city: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Получить список всех пользователей (только для администраторов)"""
    check_admin(current_user)
    query = db.query(User)
    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    return query.limit(limit).all()


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Получить данные пользователя по ID (только админ)"""
    check_admin(current_user)
    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return db_user


@router.post("/users/{user_id}/make-moderator", response_model=dict)
def make_moderator(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Назначить пользователя модератором (только волонтеры!)"""
    check_admin(current_user)
    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if db_user.user_type == UserType.admin:
        raise HTTPException(status_code=400, detail="Администратор не может быть модератором")
    if db_user.user_type == UserType.nko_member:
        raise HTTPException(status_code=400, detail="Члены НКО не могут быть модераторами")
    if db_user.user_type == UserType.moderator:
        raise HTTPException(status_code=400, detail="Пользователь уже модератор")
    db_user.user_type = UserType.moderator
    db.commit()
    db.refresh(db_user)
    return {"message": f"Пользователь {db_user.full_name} назначен модератором", "user_type": db_user.user_type}


@router.post("/users/{user_id}/remove-moderator", response_model=dict)
def remove_moderator(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Снять права модератора и вернуть волонтером"""
    check_admin(current_user)
    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if db_user.user_type != UserType.moderator:
        raise HTTPException(status_code=400, detail="Пользователь не модератор")
    db_user.user_type = UserType.volunteer
    db.commit()
    db.refresh(db_user)
    return {"message": f"Пользователь {db_user.full_name} больше не модератор", "user_type": db_user.user_type}


@router.post("/users/{user_id}/ban", response_model=dict)
def ban_user(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Забанить пользователя (только админ)"""
    check_admin(current_user)
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя забанить самого себя")
    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if db_user.user_type == UserType.admin:
        raise HTTPException(status_code=400, detail="Нельзя забанить администратора")
    db_user.is_banned = True
    db.commit()
    db.refresh(db_user)
    return {"message": f"Пользователь {db_user.full_name} заблокирован"}


@router.post("/users/{user_id}/unban", response_model=dict)
def unban_user(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Разбанить пользователя (только админ)"""
    check_admin(current_user)
    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db_user.is_banned = False
    db.commit()
    db.refresh(db_user)
    return {"message": f"Пользователь {db_user.full_name} разблокирован"}


@router.delete("/users/{user_id}/delete", response_model=dict)
def delete_user(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Удалить пользователя (только админ)"""
    check_admin(current_user)
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")
    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if db_user.user_type == UserType.admin:
        raise HTTPException(status_code=400, detail="Нельзя удалить администратора")
    db.delete(db_user)
    db.commit()
    return {"message": f"Пользователь {db_user.full_name} удален"}


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
        user_id: int,
        user_update: dict,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Обновить данные пользователя (только админ)"""
    check_admin(current_user)
    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if "full_name" in user_update:
        db_user.full_name = user_update["full_name"]
    if "email" in user_update:
        db_user.email = user_update["email"]
    if "city" in user_update:
        db_user.city = user_update["city"]
    if "organization_name" in user_update:
        db_user.organization_name = user_update["organization_name"]
    if "description" in user_update:
        db_user.description = user_update["description"]
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/users/{user_id}/delete-photo", response_model=UserResponse)
def delete_user_photo(
        user_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """✅ Удалить фотографию пользователя"""
    check_admin(current_user)

    db_user = crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Удаляем файл с диска
    if db_user.photo_url:
        try:
            file_path = db_user.photo_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")

        # Очищаем ссылку в БД
        db_user.photo_url = None

    db.commit()
    db.refresh(db_user)
    return db_user