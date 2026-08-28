from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from app.core.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(40), unique=True, nullable=False, index=True)
    name = Column(String(160), nullable=False, index=True)
    rnc = Column(String(20), nullable=True)
    phone = Column(String(40), nullable=True)
    email = Column(String(120), nullable=True)
    notes = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)