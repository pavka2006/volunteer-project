from app.database import SessionLocal
from app.models.user import User, UserType
from app.auth.security import get_password_hash

# Создай сессию БД
db = SessionLocal()

try:
    # Удали старого если есть
    old_admin = db.query(User).filter(User.email == 'admin@rosatom.ru').first()
    if old_admin:
        db.delete(old_admin)
        db.commit()
        print("❌ Старый админ удален")

    # Создай нового
    admin = User(
        user_type=UserType.admin,
        email='admin@rosatom.ru',
        password_hash=get_password_hash('password123'),  # хэшируется автоматически
        full_name='Администратор',
        city='Москва',
        is_active=True,
        is_banned=False
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    print("✅ Админ создан успешно!")
    print(f"Email: admin@rosatom.ru")
    print(f"Пароль: password123")
    print(f"ID: {admin.id}")
    print(f"Type: {admin.user_type.value}")

except Exception as e:
    print(f"❌ Ошибка: {e}")
    db.rollback()
finally:
    db.close()
