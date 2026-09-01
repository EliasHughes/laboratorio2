from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.repositories.user_repo import UserRepository
from app.api.deps import get_current_user
from app.core.permissions import get_user_permissions
from app.models.user import User
from app.schemas.user import UserOut, UserWithPermissions

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    login_id = (form_data.username or "").strip()
    user = UserRepository.get_by_login(db, login_id)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo",
        )

    token = create_access_token(subject=user.username)

    role_name = "sin_rol"
    if getattr(user, "role_rel", None) is not None:
        role_name = user.role_rel.name

        return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": role_name,
            "role_id": user.role_id,
            "is_active": user.is_active,
            "permissions": get_user_permissions(user),
        },
    }

@router.get("/me", response_model=UserWithPermissions)
def me(current_user: User = Depends(get_current_user)):
    base = UserOut.model_validate(current_user).model_dump()
    return UserWithPermissions(
        **base,
        permissions=get_user_permissions(current_user),
    )