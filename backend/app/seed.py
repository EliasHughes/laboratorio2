"""
Seed inicial de roles, permisos y usuario admin.
Ejecutar: python -m app.seed
"""
from app.core.database import SessionLocal, create_tables
from app.models.role import Role, Permission
from app.models.user import User
from app.core.security import get_password_hash

MODULES_ACTIONS = {
    "dashboard": ["view"],
    "inventory": ["view", "create", "edit", "delete"],
    "withdrawals": ["view", "create", "edit", "delete"],
    "receiving": ["view", "create", "edit", "delete"],
    "solutions": ["view", "create", "edit", "delete"],
    "kardex": ["view"],
    "forms": ["view", "create", "edit", "delete"],
    "reports": ["view", "create"],
    "users": ["view", "create", "edit", "delete"],
    "roles": ["view", "create", "edit", "delete"],
    "warehouse": ["view", "edit"],
    "wms": ["view", "create", "edit"],
    "purchases": ["view", "create", "edit"],
}

def seed():
    create_tables()
    db = SessionLocal()

    try:
        # 1. Crear todos los permisos
        all_perms = []
        for module, actions in MODULES_ACTIONS.items():
            for action in actions:
                code = f"{module}:{action}"
                existing = db.query(Permission).filter(Permission.code == code).first()
                if not existing:
                    p = Permission(
                        code=code,
                        module=module,
                        action=action,
                        description=f"{action.capitalize()} en {module}",
                    )
                    db.add(p)
                    all_perms.append(p)
                else:
                    all_perms.append(existing)
        db.commit()

        # Recargar permisos
        all_perms = db.query(Permission).all()
        perm_map = {p.code: p for p in all_perms}

        # 2. Rol Admin (sistema)
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            admin_role = Role(
                name="admin",
                description="Administrador del sistema - acceso total",
                is_system=True,
                is_active=True,
            )
            admin_role.permissions = all_perms
            db.add(admin_role)
            db.commit()

        # 3. Rol Analista
        analista_role = db.query(Role).filter(Role.name == "analista").first()
        if not analista_role:
            analista_codes = [
                "dashboard:view",
                "inventory:view", "inventory:create", "inventory:edit",
                "withdrawals:view", "withdrawals:create",
                "receiving:view", "receiving:create",
                "solutions:view", "solutions:create", "solutions:edit",
                "kardex:view",
                "forms:view", "forms:create", "forms:edit",
                "reports:view",
            ]
            analista_role = Role(
                name="analista",
                description="Analista de laboratorio",
                is_system=True,
                is_active=True,
            )
            analista_role.permissions = [perm_map[c] for c in analista_codes if c in perm_map]
            db.add(analista_role)
            db.commit()

        # 4. Rol Almacén
        almacen_role = db.query(Role).filter(Role.name == "almacen").first()
        if not almacen_role:
            almacen_codes = [
                "dashboard:view",
                "inventory:view",
                "withdrawals:view", "withdrawals:create",
                "receiving:view", "receiving:create",
                "kardex:view",
                "forms:view",
                "reports:view",
            ]
            almacen_role = Role(
                name="almacen",
                description="Personal de almacén / bodega",
                is_system=True,
                is_active=True,
            )
            almacen_role.permissions = [perm_map[c] for c in almacen_codes if c in perm_map]
            db.add(almacen_role)
            db.commit()

        # 5. Usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_role = db.query(Role).filter(Role.name == "admin").first()
            admin_user = User(
                username="admin",
                full_name="Lic. Elias Hughes",
                email="admin@yazoo.com",
                hashed_password=get_password_hash("AdminYazoo2026!"),
                role_id=admin_role.id,
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            print("✅ Usuario admin creado: Elias Hughes")
        else:
            # Asegurar que tenga role_id
            if not admin_user.role_id:
                admin_role = db.query(Role).filter(Role.name == "admin").first()
                admin_user.role_id = admin_role.id
                admin_user.full_name = "Elias Hughes"
                db.commit()
            print("ℹ️ Usuario admin ya existe")

        from app.models.product import Product

        catalog = [
            ("ALC-ETOH", "Alcohol etílico", "granel", "L"),
            ("AZU-LIQ", "Azúcar líquida", "insumo", "L"),
            ("AGUA-OSM", "Agua osmotizada", "insumo", "L"),
            ("RON-BLC", "Ron blanco", "producto_terminado", "L"),
        ]
        for code, name, cat, unit in catalog:
            if not db.query(Product).filter(Product.code == code).first():
                db.add(
                    Product(
                        code=code,
                        name=name,
                        category=cat,
                        unit=unit,
                        min_stock=0,
                        is_active=True,
                    )
                )
        db.commit()
        print("Roles, permisos y productos base sembrados")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()