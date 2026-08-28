from sqlalchemy.orm import Session, joinedload
from app.models.role import Role, Permission
from app.schemas.role import RoleCreate, RoleUpdate

class RoleRepository:

    @staticmethod
    def get_all(db: Session) -> list[Role]:
        return (
            db.query(Role)
            .options(joinedload(Role.permissions))
            .order_by(Role.name)
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, role_id: int) -> Role | None:
        return (
            db.query(Role)
            .options(joinedload(Role.permissions))
            .filter(Role.id == role_id)
            .first()
        )

    @staticmethod
    def get_by_name(db: Session, name: str) -> Role | None:
        return db.query(Role).filter(Role.name == name).first()

    @staticmethod
    def create(db: Session, data: RoleCreate) -> Role:
        role = Role(
            name=data.name.strip().lower(),
            description=data.description,
            is_active=data.is_active,
            is_system=False,
        )
        if data.permission_ids:
            perms = db.query(Permission).filter(Permission.id.in_(data.permission_ids)).all()
            role.permissions = perms
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def update(db: Session, role: Role, data: RoleUpdate) -> Role:
        if role.is_system and data.name and data.name != role.name:
            raise ValueError("No se puede renombrar un rol del sistema")

        if data.name is not None:
            role.name = data.name.strip().lower()
        if data.description is not None:
            role.description = data.description
        if data.is_active is not None:
            role.is_active = data.is_active
        if data.permission_ids is not None:
            perms = db.query(Permission).filter(Permission.id.in_(data.permission_ids)).all()
            role.permissions = perms

        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def delete(db: Session, role: Role) -> None:
        if role.is_system:
            raise ValueError("No se puede eliminar un rol del sistema")
        if role.users:
            raise ValueError("El rol tiene usuarios asignados. Reasígnalos primero.")
        db.delete(role)
        db.commit()


class PermissionRepository:

    @staticmethod
    def get_all(db: Session) -> list[Permission]:
        return db.query(Permission).order_by(Permission.module, Permission.action).all()

    @staticmethod
    def get_by_ids(db: Session, ids: list[int]) -> list[Permission]:
        return db.query(Permission).filter(Permission.id.in_(ids)).all()