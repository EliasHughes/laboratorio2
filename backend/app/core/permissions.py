from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role, Permission

ALL_PERMISSIONS = [
    "dashboard:view",
    "inventory:view", "inventory:create", "inventory:edit",
    "receiving:view", "receiving:create",
    "warehouse:view",
    "wms:view", "wms:create", "wms:edit",
    "withdrawals:view", "withdrawals:create",
    "forms:view", "forms:create", "forms:edit",
    "kardex:view",
    "reports:view",
    "users:view", "users:create",
    "roles:view", "roles:edit",
    "purchases:view",
    "solutions:view",
    "ehs:view", "ehs:create", "ehs:edit",
]


def has_permission(user: User, module: str, action: str) -> bool:
    if not user or not user.is_active:
        return False
    if user.role_rel and user.role_rel.name == "admin" and user.role_rel.is_system:
        return True
    code = f"{module}:{action}"
    if not user.role_rel:
        return False
    return any(p.code == code for p in user.role_rel.permissions)

import json

def _extra(user: User) -> list[str]:
    raw = getattr(user, "extra_screens", None) or ""
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return [str(x) for x in data] if isinstance(data, list) else []
    except Exception:
        return []


def has_permission(user: User, module: str, action: str) -> bool:
    if not user or not user.is_active:
        return False
    if user.role_rel and user.role_rel.name == "admin" and user.role_rel.is_system:
        return True
    code = f"{module}:{action}"
    if code in _extra(user):
        return True
    if not user.role_rel:
        return False
    return any(p.code == code for p in user.role_rel.permissions)


def get_user_permissions(user: User) -> list[str]:
    role_perms = []
    if user and user.role_rel:
        if user.role_rel.name == "admin" and user.role_rel.is_system:
            role_perms = [p.code for p in user.role_rel.permissions]
        else:
            role_perms = [p.code for p in user.role_rel.permissions]
    extra = _extra(user) if user else []
    return sorted(set(role_perms + extra))