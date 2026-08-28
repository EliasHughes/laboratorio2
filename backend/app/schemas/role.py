from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class PermissionOut(BaseModel):
    id: int
    code: str
    module: str
    action: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RoleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    is_active: bool = True


class RoleCreate(RoleBase):
    permission_ids: List[int] = []


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    permission_ids: Optional[List[int]] = None


class RoleOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_system: bool
    is_active: bool
    created_at: datetime
    permissions: List[PermissionOut] = []

    model_config = ConfigDict(from_attributes=True)