from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint, Text
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

class QualityBoard(Base):
    __tablename__ = "quality_boards"

    id = Column(Integer, primary_key=True)
    board = Column(String(30), nullable=False, index=True)
    lot_number = Column(String(80), nullable=True)
    product_name = Column(String(200), nullable=False, default="")
    qty = Column(Float, nullable=False, default=0)
    unit = Column(String(20), nullable=True)
    color = Column(String(20), nullable=False, default="verde")
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)