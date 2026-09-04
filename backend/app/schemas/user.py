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
    position: Optional[str] = None
    supervisor_id: Optional[int] = None
    manager_id: Optional[int] = None
    signature_data: Optional[str] = None
    extra_screens: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    position: Optional[str] = None
    supervisor_id: Optional[int] = None
    manager_id: Optional[int] = None
    signature_data: Optional[str] = None
    extra_screens: Optional[str] = None


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    email: Optional[str] = None
    role_id: int
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    position: Optional[str] = None
    supervisor_id: Optional[int] = None
    manager_id: Optional[int] = None
    signature_data: Optional[str] = None
    extra_screens: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserWithPermissions(UserOut):
    permissions: List[str] = []