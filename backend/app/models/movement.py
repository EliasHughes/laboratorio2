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
    solucion_interna = "solucion_interna"
    transferencia = "transferencia"


MOVEMENT_TYPE_ALIASES = {
    "entrada": MovementType.ingreso,
    "ingreso": MovementType.ingreso,
    "salida": MovementType.retiro_analisis,
    "retiro": MovementType.retiro_analisis,
    "retiro_analisis": MovementType.retiro_analisis,
    "despacho": MovementType.despacho_produccion,
    "despacho_produccion": MovementType.despacho_produccion,
    "ajuste": MovementType.ajuste,
    "solucion_interna": MovementType.solucion_interna,
    "transferencia": MovementType.transferencia,
    "transfer": MovementType.transferencia,
}


def resolve_movement_type(raw) -> MovementType:
    if isinstance(raw, MovementType):
        return raw
    key = str(raw or "ajuste").strip().lower()
    return MOVEMENT_TYPE_ALIASES.get(key, MovementType.ajuste)


class Movement(Base):
    __tablename__ = "movements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey("lots.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(40), nullable=False)
    qty: Mapped[float] = mapped_column(Float, nullable=False)
    destination: Mapped[str] = mapped_column(String(200), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    lot = relationship("Lot", back_populates="movements")
    user = relationship("User", back_populates="movements")