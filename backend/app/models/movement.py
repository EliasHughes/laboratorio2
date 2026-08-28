from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum

class MovementType(str, enum.Enum):
    ingreso = "ingreso"
    retiro_analisis = "retiro_analisis"
    despacho_produccion = "despacho_produccion"
    ajuste = "ajuste"
    solucion_interna = "solucion_interna"  # cuando se prepara una solución secundaria

class Movement(Base):
    __tablename__ = "movements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey("lots.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[MovementType] = mapped_column(SAEnum(MovementType), nullable=False)
    qty: Mapped[float] = mapped_column(Float, nullable=False)
    destination: Mapped[str] = mapped_column(String(200), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    lot = relationship("Lot", back_populates="movements")
    user = relationship("User", back_populates="movements")