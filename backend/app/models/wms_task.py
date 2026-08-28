"""Tareas de piso (WMS). Una fila = un trabajo de scan."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.core.database import Base


class WmsTask(Base):
    __tablename__ = "wms_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_type = Column(String(40), nullable=False, index=True)  # receive|putaway|transfer|pick|count
    status = Column(String(20), nullable=False, default="pending", index=True)
    product_id = Column(Integer, nullable=True, index=True)
    lot_id = Column(Integer, nullable=True, index=True)
    from_location = Column(String(80), nullable=True)
    to_location = Column(String(80), nullable=True)
    qty_planned = Column(Float, nullable=False, default=0)
    qty_done = Column(Float, nullable=False, default=0)
    barcode = Column(String(80), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    assigned_to = Column(Integer, nullable=True, index=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)