from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


class UserRepository:

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        return (
            db.query(User)
            .options(joinedload(User.role_rel))
            .filter(User.id == user_id)
            .first()
        )

    @staticmethod
    def get_by_username(db: Session, username: str):
        return (
            db.query(User)
            .options(joinedload(User.role_rel))
            .filter(User.username == username)
            .first()
        )

    @staticmethod
    def get_by_login(db: Session, login_id: str):
        login_id = (login_id or "").strip()
        if not login_id:
            return None
        return (
            db.query(User)
            .options(joinedload(User.role_rel))
            .filter(
                or_(
                    User.username == login_id,
                    User.email == login_id,
                )
            )
            .first()
        )

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
        return (
            db.query(User)
            .options(joinedload(User.role_rel))
            .order_by(User.full_name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(db: Session, data: UserCreate) -> User:
        user = User(
            username=data.username,
            full_name=data.full_name,
            email=data.email,
            hashed_password=get_password_hash(data.password),
            role_id=data.role_id,
            is_active=data.is_active,
            position=getattr(data, "position", None),
            supervisor_id=getattr(data, "supervisor_id", None),
            manager_id=getattr(data, "manager_id", None),
            signature_data=getattr(data, "signature_data", None),
            extra_screens=getattr(data, "extra_screens", None),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return UserRepository.get_by_id(db, user.id)

    @staticmethod
    def update(db: Session, user: User, data: UserUpdate) -> User:
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.email is not None:
            user.email = data.email
        if data.role_id is not None:
            user.role_id = data.role_id
        if data.is_active is not None:
            user.is_active = data.is_active
        if data.password:
            user.hashed_password = get_password_hash(data.password)
        if getattr(data, "position", None) is not None:
            user.position = data.position
        if getattr(data, "supervisor_id", None) is not None:
            user.supervisor_id = data.supervisor_id
        if getattr(data, "manager_id", None) is not None:
            user.manager_id = data.manager_id
        if getattr(data, "signature_data", None) is not None:
            user.signature_data = data.signature_data
        if getattr(data, "extra_screens", None) is not None:
            user.extra_screens = data.extra_screens
        db.commit()
        db.refresh(user)
        return UserRepository.get_by_id(db, user.id)

    @staticmethod
    def delete(db: Session, user: User) -> None:
        user.is_active = False
        db.commit()