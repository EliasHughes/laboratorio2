from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Solution(Base):
    __tablename__ = "solutions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    formula = Column(Text, nullable=True)
    target_volume = Column(Float, nullable=True)
    unit = Column(String(20), default="mL")
    prepared_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    status = Column(String(30), default="preparada")  # preparada | en_uso | agotada | descartada
    notes = Column(Text, nullable=True)
    prepared_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    prepared_by = relationship("User", foreign_keys=[prepared_by_id])
    components = relationship("SolutionComponent", back_populates="solution", cascade="all, delete-orphan")


class SolutionComponent(Base):
    __tablename__ = "solution_components"

    id = Column(Integer, primary_key=True, index=True)
    solution_id = Column(Integer, ForeignKey("solutions.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=True)
    component_name = Column(String(200), nullable=False)
    qty_used = Column(Float, nullable=False)
    unit = Column(String(20), default="mL")

    solution = relationship("Solution", back_populates="components")