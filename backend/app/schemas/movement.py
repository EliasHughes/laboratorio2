from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class MovementType(str, Enum):
    entrada = "entrada"
    salida = "salida"
    ajuste = "ajuste"

class MovementCreate(BaseModel):
    lot_id: int
    qty: float = Field(..., gt=0)
    type: MovementType = MovementType.salida
    reason: Optional[str] = None
    destination: Optional[str] = None
    notes: Optional[str] = None

class MovementOut(BaseModel):
    id: int
    lot_id: int
    lot_number: Optional[str] = None
    product_name: Optional[str] = None
    qty: float
    type: str
    reason: Optional[str] = None
    destination: Optional[str] = None
    notes: Optional[str] = None
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)