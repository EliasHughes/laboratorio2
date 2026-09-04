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
    from app.models import form_record, audit_log, wms_task, lot_stock  # noqa: F401
    from app.models import purchase_order, supplier, solution, role  # noqa: F401
    from app.models import ehs, form_attachment  # noqa: F401
    from sqlalchemy import text

    Base.metadata.create_all(bind=engine)
    print("Tablas creadas / verificadas correctamente en SQL Server")

    stmts = [
        "IF COL_LENGTH('dbo.users','position') IS NULL ALTER TABLE dbo.users ADD position NVARCHAR(120) NULL;",
        "IF COL_LENGTH('dbo.users','supervisor_id') IS NULL ALTER TABLE dbo.users ADD supervisor_id INT NULL;",
        "IF COL_LENGTH('dbo.users','manager_id') IS NULL ALTER TABLE dbo.users ADD manager_id INT NULL;",
        "IF COL_LENGTH('dbo.users','signature_data') IS NULL ALTER TABLE dbo.users ADD signature_data NVARCHAR(MAX) NULL;",
        "IF COL_LENGTH('dbo.users','extra_screens') IS NULL ALTER TABLE dbo.users ADD extra_screens NVARCHAR(MAX) NULL;",
    ]
    with engine.begin() as conn:
        for s in stmts:
            conn.execute(text(s))