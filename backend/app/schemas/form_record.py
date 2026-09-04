from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class FormRecordCreate(BaseModel):
    form_type: str
    form_code: Optional[str] = None
    title: str
    data: Dict[str, Any] = Field(default_factory=dict)
    payload: Optional[Dict[str, Any]] = None
    status: str = "borrador"
    lot_id: Optional[int] = None
    lot_number: Optional[str] = None


class FormRecordUpdate(BaseModel):
    title: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    payload: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    lot_id: Optional[int] = None
    lot_number: Optional[str] = None


class FormRecordOut(BaseModel):
    id: int
    form_type: str
    form_code: Optional[str] = None
    title: str
    data: Dict[str, Any] = Field(default_factory=dict)
    payload: Dict[str, Any] = Field(default_factory=dict)
    status: str
    created_by_id: Optional[int] = None
    updated_by_id: Optional[int] = None
    created_by_name: Optional[str] = None
    updated_by_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    lot_id: Optional[int] = None
    lot_number: Optional[str] = None
    author_signature: Optional[str] = None
    supervisor_id: Optional[int] = None
    manager_id: Optional[int] = None
    supervisor_status: Optional[str] = None
    manager_status: Optional[str] = None
    supervisor_signature: Optional[str] = None
    manager_signature: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)