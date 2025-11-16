from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.user import UserRegister, UserLogin, Token, UserResponse, UserUpdate
from ..crud import user as crud_user
from ..auth.security import verify_password, get_password_hash
from ..auth.jwt_handler import create_access_token, get_current_active_user
from ..config import settings
from ..models.user import User
from ..schemas.user import EmailChangeRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    # Проверка существования пользователя
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email уже зарегистрирован"
        )

    # Создание пользователя
    new_user = crud_user.create_user(db=db, user=user)

    # Создание токена
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "user_type": new_user.user_type.value},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "user_type": new_user.user_type.value,
            "full_name": new_user.full_name,
            "city": new_user.city
        }
    }


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Вход в систему"""
    user = crud_user.get_user_by_email(db, email=user_credentials.email)

    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверка что пользователь не забанен
    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ваш аккаунт заблокирован"
        )

    # Создание токена
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_type": user.user_type.value},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Получить информацию о текущем пользователе"""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
        user_update: UserUpdate,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Обновить профиль текущего пользователя"""
    updated_user = crud_user.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return updated_user


@router.put("/email")
async def change_email(
        email_change: EmailChangeRequest,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Изменить email с подтверждением пароля"""
    result = crud_user.change_email(db, current_user.id, email_change.new_email, email_change.password)

    if result is False:
        raise HTTPException(
            status_code=401,
            detail="Неправильный пароль"
        )

    if result == "email_exists":
        raise HTTPException(
            status_code=400,
            detail="Email уже используется"
        )

    return {
        "message": "Email успешно изменён",
        "new_email": email_change.new_email
    }


@router.put("/avatar")
async def upload_avatar(
        photo_url: str,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Загрузить аватарку (URL или base64)"""
    updated_user = crud_user.update_user(
        db,
        current_user.id,
        UserUpdate(photo_url=photo_url)
    )

    if not updated_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return {"message": "Аватарка обновлена", "photo_url": updated_user.photo_url}
