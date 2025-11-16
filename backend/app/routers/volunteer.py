from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..schemas.user import FavoriteCreate, FavoriteResponse
from ..crud import user as crud_user
from ..auth.jwt_handler import get_current_active_user
from ..models.user import User, UserType

router = APIRouter(prefix="/api/volunteers", tags=["Volunteers"])


def check_volunteer(current_user: User):
    """Проверка, что пользователь - волонтер"""
    if current_user.user_type != UserType.volunteer:
        raise HTTPException(
            status_code=403,
            detail="Доступ только для волонтеров"
        )
    return current_user


@router.post("/favorites", response_model=FavoriteResponse)
def add_to_favorites(
        favorite: FavoriteCreate,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Добавить в избранное"""
    check_volunteer(current_user)

    db_favorite = crud_user.add_favorite(db, current_user.id, favorite)
    if not db_favorite:
        raise HTTPException(status_code=400, detail="Элемент уже в избранном")
    return db_favorite


@router.get("/favorites", response_model=List[FavoriteResponse])
def get_favorites(
        item_type: Optional[str] = None,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Получить список избранного"""
    check_volunteer(current_user)
    return crud_user.get_favorites(db, current_user.id, item_type)


@router.delete("/favorites/{favorite_id}")
def remove_from_favorites(
        favorite_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Удалить из избранного"""
    check_volunteer(current_user)

    success = crud_user.delete_favorite(db, current_user.id, favorite_id)
    if not success:
        raise HTTPException(status_code=404, detail="Элемент не найден")
    return {"message": "Успешно удалено из избранного"}
