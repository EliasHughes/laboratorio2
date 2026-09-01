from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from app.core.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    area = Column(String(100), nullable=True)
    severity = Column(String(30), nullable=False, default="media")
    status = Column(String(30), nullable=False, default="abierto")
    description = Column(Text, nullable=True)
    lot_number = Column(String(80), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)