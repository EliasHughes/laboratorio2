from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role, Permission

def has_permission(user: User, module: str, action: str) -> bool:
    """Verifica si el usuario tiene el permiso module:action."""
    if not user or not user.role_rel or not user.is_active:
        return False

    # Admin del sistema siempre tiene todo
    if user.role_rel.name == "admin" and user.role_rel.is_system:
        return True

    code = f"{module}:{action}"
    return any(p.code == code for p in user.role_rel.permissions)


def get_user_permissions(user: User) -> list[str]:
    if not user or not user.role_rel:
        return []
    if user.role_rel.name == "admin" and user.role_rel.is_system:
        # devolver todos los permisos existentes sería ideal, pero por ahora:
        return [p.code for p in user.role_rel.permissions]
    return [p.code for p in user.role_rel.permissions]