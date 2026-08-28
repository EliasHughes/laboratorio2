from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import create_tables
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.api import api_router
from app.api import roles   # agrega esta línea
from app.api import alerts
from app.api import receiving
from app.api import withdrawals
from app.api import wms
from app.api import purchases
from app.api.forms import router as forms_router

settings = get_settings()
logger = setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Iniciando Yazoo Lab Inventory API...")
    logger.info(f"📍 Ambiente: {settings.ENVIRONMENT}")
    create_tables()
    yield
    logger.info("👋 Cerrando aplicación...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sistema de Control de Inventario Industrial - Rones y Bebidas del Caribe Yazoo",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# CORS — lo primero después de crear app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3005",
        "http://localhost:3005",
        "http://172.21.20.14:3005",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {
        "message": "Yazoo Lab Inventory API",
        "company": "Rones y Bebidas del Caribe Yazoo",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

@app.on_event("startup")
def _ensure_indexes():
    from app.core.db_optimize import ensure_performance_indexes
    try:
        ensure_performance_indexes()
    except Exception as e:
        print(f"[startup] db_optimize: {e}")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(receiving.router, prefix="/api/v1")
app.include_router(api_router, prefix="/api/v1")
app.include_router(roles.router, prefix="/api/v1")
app.include_router(withdrawals.router, prefix="/api/v1")
app.include_router(wms.router, prefix="/api/v1")
app.include_router(purchases.router, prefix="/api/v1")
app.include_router(forms_router, prefix="/api/v1")