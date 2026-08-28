from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_permission, require_admin
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserOut, UserWithPermissions
from app.repositories.user_repo import UserRepository
from app.core.permissions import get_user_permissions

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users", "view")),
):
    return UserRepository.get_all(db)


@router.get("/me", response_model=UserWithPermissions)
def get_me(current_user: User = Depends(get_current_user)):
    return UserWithPermissions(
        **UserOut.model_validate(current_user).model_dump(),
        permissions=get_user_permissions(current_user),
    )


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users", "create")),
):
    if UserRepository.get_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    return UserRepository.create(db, data)


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users", "edit")),
):
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.id == current_user.id and data.is_active is False:
        raise HTTPException(status_code=400, detail="No puedes desactivarte a ti mismo")
    return UserRepository.update(db, user, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users", "delete")),
):
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    UserRepository.delete(db, user)