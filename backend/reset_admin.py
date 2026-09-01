"""Restablece la clave del usuario admin.
Ejecutar desde la carpeta backend:

    python reset_admin.py
"""
from app.core.database import SessionLocal, create_tables
from app.models.user import User
from app.models.role import Role
from app.core.security import get_password_hash

PASSWORD = "AdminYazoo2026!"


def main():
    create_tables()
    db = SessionLocal()
    try:
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            if not admin_role:
                print("No existe el rol admin. Corre primero: python -m app.seed")
                return
            user = User(
                username="admin",
                full_name="Lic. Elias Hughes",
                email="admin@yazoo.com",
                hashed_password=get_password_hash(PASSWORD),
                role_id=admin_role.id,
                is_active=True,
            )
            db.add(user)
            print("Usuario admin creado")
        else:
            user.hashed_password = get_password_hash(PASSWORD)
            user.is_active = True
            if admin_role and not user.role_id:
                user.role_id = admin_role.id
            print("Clave de admin restablecida")
        db.commit()
        print("Usuario: admin")
        print("Clave:   " + PASSWORD)
    except Exception as e:
        db.rollback()
        print("Error:", e)
    finally:
        db.close()


if __name__ == "__main__":
    main()