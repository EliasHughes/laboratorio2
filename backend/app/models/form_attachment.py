from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.core.database import Base


class FormAttachment(Base):
    __tablename__ = "form_attachments"

    id = Column(Integer, primary_key=True)
    form_id = Column(Integer, ForeignKey("form_records.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    rel_path = Column(String(500), nullable=False)
    mime = Column(String(80), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())