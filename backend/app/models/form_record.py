from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class FormRecord(Base):
    __tablename__ = "form_records"

    id = Column(Integer, primary_key=True, index=True)
    form_type = Column(String(80), nullable=False, index=True)
    form_code = Column(String(50), nullable=True)
    title = Column(String(200), nullable=False)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=True, index=True)
    lot_number = Column(String(80), nullable=True)
    data_json = Column(Text, nullable=False, default="{}")
    status = Column(String(30), default="borrador")
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    author_signature = Column(Text, nullable=True)
    supervisor_id = Column(Integer, nullable=True)
    manager_id = Column(Integer, nullable=True)
    supervisor_status = Column(String(20), nullable=True)
    manager_status = Column(String(20), nullable=True)
    supervisor_note = Column(String(400), nullable=True)
    manager_note = Column(String(400), nullable=True)
    supervisor_signature = Column(Text, nullable=True)
    manager_signature = Column(Text, nullable=True)

    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])