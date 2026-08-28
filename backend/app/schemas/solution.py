from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date, datetime

class ComponentIn(BaseModel):
    product_id: Optional[int] = None
    lot_id: Optional[int] = None
    component_name: str
    qty_used: float = Field(..., gt=0)
    unit: str = "mL"

class SolutionCreate(BaseModel):
    code: str
    name: str
    formula: Optional[str] = None
    target_volume: Optional[float] = None
    unit: str = "mL"
    prepared_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    components: List[ComponentIn] = []

class ComponentOut(BaseModel):
    id: int
    component_name: str
    qty_used: float
    unit: str
    product_id: Optional[int] = None
    lot_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class SolutionOut(BaseModel):
    id: int
    code: str
    name: str
    formula: Optional[str] = None
    target_volume: Optional[float] = None
    unit: str
    prepared_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: str
    notes: Optional[str] = None
    prepared_by_id: Optional[int] = None
    prepared_by_name: Optional[str] = None
    components: List[ComponentOut] = []
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)