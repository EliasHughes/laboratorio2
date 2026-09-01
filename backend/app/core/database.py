from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    from app.models import product, lot, movement, user  # noqa: F401
    from app.models import form_record, audit_log, wms_task  # noqa: F401
    from app.models import purchase_order, supplier, solution, role  # noqa: F401
    from app.models import lot_stock, ehs  # noqa: F401
    from app.models import form_attachment  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas / verificadas correctamente en SQL Server")