from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.core.database import Base


class EhsMonthly(Base):
    __tablename__ = "ehs_monthly"

    id = Column(Integer, primary_key=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    nave = Column(String(40), nullable=True)
    area = Column(String(120), nullable=False)
    accidents = Column(Integer, nullable=False, default=0)
    lost_days = Column(Integer, nullable=False, default=0)
    avg_workers = Column(Float, nullable=False, default=0)
    hht = Column(Float, nullable=True)
    constant = Column(Float, nullable=False, default=200000)
    created_at = Column(DateTime, default=datetime.utcnow)


class EhsRecord(Base):
    __tablename__ = "ehs_records"

    id = Column(Integer, primary_key=True)
    kind = Column(String(30), nullable=False)
    title = Column(String(200), nullable=False)
    area = Column(String(120), nullable=True)
    status = Column(String(30), nullable=False, default="abierto")
    payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)