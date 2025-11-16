from sqlalchemy.orm import Session
from ..models.user import User, Favorite, UserType
from ..schemas.user import UserRegister, UserUpdate, FavoriteCreate
from ..auth.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str):
    """Получить пользователя по email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    """Получить пользователя по ID"""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserRegister):
    """Создать нового пользователя"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        user_type=user.user_type,
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        organization_name=user.organization_name,
        city=user.city
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: UserUpdate):
    """Обновить профиль пользователя"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


def change_email(db: Session, user_id: int, new_email: str, current_password: str):
    """Изменить email пользователя с проверкой пароля"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    # Проверка пароля
    if not verify_password(current_password, db_user.password_hash):
        return False

    # Проверка, что новый email не занят
    if get_user_by_email(db, new_email):
        return "email_exists"

    db_user.email = new_email
    db.commit()
    db.refresh(db_user)
    return db_user


def make_moderator(db: Session, user_id: int):
    """Назначить пользователя модератором"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    db_user.user_type = UserType.moderator
    db.commit()
    db.refresh(db_user)
    return db_user


def remove_moderator(db: Session, user_id: int):
    """Снять модератора (вернуть волонтером)"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    db_user.user_type = UserType.volunteer
    db.commit()
    db.refresh(db_user)
    return db_user


def get_all_users(db: Session, city: str = None, search: str = None, limit: int = 100):
    """Получить всех пользователей с фильтрами"""
    query = db.query(User)

    if city:
        query = query.filter(User.city == city)

    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )

    return query.order_by(User.full_name).limit(limit).all()


def ban_user(db: Session, user_id: int):
    """Забанить пользователя"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    db_user.is_banned = True
    db.commit()
    db.refresh(db_user)
    return db_user


def unban_user(db: Session, user_id: int):
    """Разбанить пользователя"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    db_user.is_banned = False
    db.commit()
    db.refresh(db_user)
    return db_user


# Операции с избранным
def add_favorite(db: Session, user_id: int, favorite: FavoriteCreate):
    """Добавить в избранное"""
    existing = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.item_type == favorite.item_type,
        Favorite.item_id == favorite.item_id
    ).first()

    if existing:
        return None

    db_favorite = Favorite(
        user_id=user_id,
        item_type=favorite.item_type,
        item_id=favorite.item_id
    )
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite


def get_favorites(db: Session, user_id: int, item_type: str = None):
    """Получить избранное пользователя"""
    query = db.query(Favorite).filter(Favorite.user_id == user_id)
    if item_type:
        query = query.filter(Favorite.item_type == item_type)
    return query.all()


def delete_favorite(db: Session, user_id: int, favorite_id: int):
    """Удалить из избранного"""
    db_favorite = db.query(Favorite).filter(
        Favorite.id == favorite_id,
        Favorite.user_id == user_id
    ).first()

    if db_favorite:
        db.delete(db_favorite)
        db.commit()
        return True
    return False
