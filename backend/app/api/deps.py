from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.core.permissions import has_permission
from app.repositories.user_repo import UserRepository
from app.models.audit_log import AuditLog


from app.core.permissions import has_permission as check_permission

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    username = decode_access_token(token)
    if username is None:
        raise credentials_exception

    user = UserRepository.get_by_username(db, username)
    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_permission(module: str, action: str):
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if not check_permission(current_user, module, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permiso para '{action}' en el módulo '{module}'",
            )
        return current_user
    return permission_checker


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.role_rel or current_user.role_rel.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de administrador",
        )
    return current_user


def require_roles(*allowed_roles: str):
    """
    Permite acceso solo a los roles indicados (por nombre).
    Uso:
        Depends(require_roles("admin", "analista"))
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        role_name = current_user.role_rel.name if current_user.role_rel else ""
        if role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes el rol necesario para esta acción",
            )
        return current_user
    return role_checker


def create_audit_log(
    db: Session,
    user: User,
    action: str,
    entity: str,
    entity_id: Optional[int] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Registra una acción en la tabla de auditoría."""
    log = AuditLog(
        user_id=user.id,
        username=user.username,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_client_ip(request: Request) -> str:
    """Obtiene la IP real del cliente (soporta proxies)."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"