from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import require_admin, get_current_user
from app.models.user import User
from app.schemas.role import RoleCreate, RoleUpdate, RoleOut, PermissionOut
from app.repositories.role_repo import RoleRepository, PermissionRepository

router = APIRouter(prefix="/roles", tags=["Roles & Permissions"])


@router.get("", response_model=list[RoleOut])
def list_roles(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return RoleRepository.get_all(db)


@router.get("/permissions", response_model=list[PermissionOut])
def list_permissions(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return PermissionRepository.get_all(db)


@router.post("", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
def create_role(
    data: RoleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if RoleRepository.get_by_name(db, data.name):
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre")
    try:
        return RoleRepository.create(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{role_id}", response_model=RoleOut)
def update_role(
    role_id: int,
    data: RoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    role = RoleRepository.get_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    try:
        return RoleRepository.update(db, role, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    role = RoleRepository.get_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    try:
        RoleRepository.delete(db, role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))