from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.api.routers.chat_router import router as chat_router
from app.api.routers.agent_router import router as agent_router
from app.api.routers.chat_run_log_router import router as chat_run_log_router
from app.api.routers.admin_router import router as admin_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# ✅ CORS 설정 추가
origins = [
    "http://localhost:3000",   # CRA
    "http://127.0.0.1:3000",
    "http://localhost:5173",   # Vite
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # 허용할 프론트 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(chat_router)
app.include_router(agent_router)
app.include_router(chat_run_log_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "message": "Practice Agent API is running",
        "version": settings.APP_VERSION,
    }