from sqlalchemy.orm import Session, joinedload
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from sqlalchemy import or_

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
            .options(joinedload(User.role_rel))  # ajusta el nombre de la relación si es distinto
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
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        # recargar con role
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
        db.commit()
        db.refresh(user)
        return UserRepository.get_by_id(db, user.id)

    @staticmethod
    def delete(db: Session, user: User) -> None:
        user.is_active = False
        db.commit()