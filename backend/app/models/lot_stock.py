from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class LotStock(Base):
    __tablename__ = "lot_stocks"
    __table_args__ = (UniqueConstraint("lot_id", "location", name="uq_lot_stocks_lot_loc"),)

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=False, index=True)
    location = Column(String(100), nullable=False)
    qty = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    lot = relationship("Lot", backref="stocks")