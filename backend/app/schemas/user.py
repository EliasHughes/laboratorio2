from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    full_name: str
    email: Optional[EmailStr] = None
    role_id: int
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    email: Optional[str] = None
    role_id: int
    role: str                          # nombre del rol (property)
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserWithPermissions(UserOut):
    permissions: List[str] = []