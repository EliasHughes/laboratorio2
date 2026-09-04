import json
from sqlalchemy.orm import Session
from app.models.user import User


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
    role_name = (user.role_rel.name if user.role_rel else "") or ""
    if role_name.lower() == "admin":
        return True
    code = f"{module}:{action}"
    if code in _extra(user):
        return True
    if not user.role_rel:
        return False
    return any(getattr(p, "code", "") == code for p in (user.role_rel.permissions or []))


def get_user_permissions(user: User) -> list[str]:
    if not user:
        return []
    extra = _extra(user)
    if user.role_rel and user.role_rel.name.lower() == "admin":
        return sorted(set([p.code for p in (user.role_rel.permissions or [])] + extra))
    role_perms = [p.code for p in (user.role_rel.permissions or [])] if user.role_rel else []
    return sorted(set(role_perms + extra))