def seed_rbac():
    from app.core.database import SessionLocal
    from app.models.role import Role, Permission
    from app.core.permissions import ALL_PERMISSIONS

    packs = {
        "almacen": [
            "dashboard:view", "inventory:view", "receiving:view", "receiving:create",
            "warehouse:view", "wms:view", "wms:create", "wms:edit", "reports:view",
        ],
        "wms": ["dashboard:view", "warehouse:view", "wms:view", "wms:create", "wms:edit"],
        "analista": [
            "dashboard:view", "inventory:view", "forms:view", "forms:create", "forms:edit",
            "withdrawals:view", "withdrawals:create", "kardex:view", "reports:view",
        ],
        "calidad": [
            "dashboard:view", "inventory:view", "forms:view", "forms:create", "forms:edit",
            "kardex:view", "reports:view",
        ],
        "consulta": ["dashboard:view", "inventory:view", "kardex:view", "reports:view", "forms:view"],
        "ehs": [
            "dashboard:view", "inventory:view", "forms:view", "ehs:view", "ehs:create", "ehs:edit",
        ],
    }
    db = SessionLocal()
    try:
        perms = {}
        for code in ALL_PERMISSIONS:
            module, action = code.split(":")
            row = db.query(Permission).filter(Permission.code == code).first()
            if not row:
                row = Permission(code=code, module=module, action=action, description=code)
                db.add(row)
                db.flush()
            perms[code] = row
        for name, codes in packs.items():
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=name, is_system=True, is_active=True)
                db.add(role)
                db.flush()
            role.permissions = [perms[c] for c in codes if c in perms]
        db.commit()
        print("[bootstrap] roles y permisos listos")
    except Exception as e:
        db.rollback()
        print(f"[bootstrap] rbac: {e}")
    finally:
        db.close()