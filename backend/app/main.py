from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, volunteer, admin, moderator, nko

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Добрые дела Росатома - API",
    description="API для системы авторизации и личных кабинетов",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

# Создание приложения FastAPI


# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth.router)
app.include_router(volunteer.router)
app.include_router(admin.router)      # НОВОЕ
app.include_router(moderator.router)  # НОВОЕ
app.include_router(nko.router)        # НОВОЕ

@app.get("/")
def read_root():
    return {
        "message": "Добро пожаловать в API системы 'Добрые дела Росатома'",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
