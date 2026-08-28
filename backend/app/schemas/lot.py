from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime
from enum import Enum

class LotStatus(str, Enum):
    disponible = "disponible"
    por_vencer = "por_vencer"
    vencido = "vencido"
    cuarentena = "cuarentena"

class LotCreate(BaseModel):
    product_id: int
    lot_number: str = Field(..., min_length=1, max_length=80)
    initial_qty: float = Field(..., gt=0)
    current_qty: Optional[float] = None
    expiration_date: date          # el frontend envía este nombre
    received_date: Optional[date] = None
    status: Optional[LotStatus] = LotStatus.disponible
    notes: Optional[str] = None
    coa_number: Optional[str] = None
    location: Optional[str] = None

class LotUpdate(BaseModel):
    lot_number: Optional[str] = None
    current_qty: Optional[float] = None
    expiration_date: Optional[date] = None
    received_date: Optional[date] = None
    status: Optional[LotStatus] = None
    notes: Optional[str] = None
    coa_number: Optional[str] = None
    location: Optional[str] = None

class LotOut(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    product_code: Optional[str] = None
    lot_number: str
    initial_qty: float
    current_qty: float
    expiration_date: date
    received_date: Optional[date] = None
    status: str
    notes: Optional[str] = None
    coa_number: Optional[str] = None
    location: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)