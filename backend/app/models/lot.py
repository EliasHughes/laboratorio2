from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class LotStatus(str, enum.Enum):
    disponible = "disponible"
    por_vencer = "por_vencer"
    vencido = "vencido"
    cuarentena = "cuarentena"
    agotado = "agotado"
    retenido = "retenido"

class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    lot_number = Column(String(80), unique=True, nullable=False, index=True)
    initial_qty = Column(Float, nullable=False)
    current_qty = Column(Float, nullable=False)
    min_qty = Column(Float, nullable=True)
    # Nombres reales en SQL Server:
    expiry_date = Column(Date, nullable=False, index=True)
    arrival_date = Column(Date, nullable=True)
    location = Column(String(100), nullable=True)
    status = Column(SAEnum(LotStatus), default=LotStatus.disponible, nullable=False)
    coa_number = Column(String(80), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="lots")
    movements = relationship("Movement", back_populates="lot")