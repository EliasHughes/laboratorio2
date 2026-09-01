from datetime import datetime

from sqlalchemy.orm import Session


def write_movement(
    db: Session,
    *,
    lot_id: int,
    user_id: int,
    qty: float,
    destination: str | None = None,
    notes: str | None = None,
    kinds: tuple[str, ...] = ("ingreso", "entrada", "ajuste", "transferencia", "transfer"),
) -> str:
    """Persiste un movimiento. Prueba varios valores de type por si SQL Server
    tiene un CHECK/ENUM viejo. Devuelve 'ok' o el último error."""
    from app.models.movement import Movement, MovementType, resolve_movement_type

    last = "sin intentar"
    for kind in kinds:
        try:
            resolved = resolve_movement_type(kind)
            mov = Movement(
                lot_id=int(lot_id),
                user_id=int(user_id),
                qty=float(qty),
                destination=destination,
                notes=notes,
                created_at=datetime.utcnow(),
            )
            try:
                mov.type = resolved.value if hasattr(resolved, "value") else str(resolved)
            except Exception:
                mov.type = kind
            db.add(mov)
            db.commit()
            return "ok"
        except Exception as e:
            db.rollback()
            last = str(e)
            try:
                mov = Movement()
                mov.lot_id = int(lot_id)
                mov.user_id = int(user_id)
                mov.qty = float(qty)
                if hasattr(mov, "destination"):
                    mov.destination = destination
                if hasattr(mov, "notes"):
                    mov.notes = notes
                setattr(mov, "type", kind)
                db.add(mov)
                db.commit()
                return "ok"
            except Exception as e2:
                db.rollback()
                last = str(e2)
    return last


def backfill_missing_ingresos(db: Session, user_id: int) -> int:
    from app.models.lot import Lot
    from app.models.movement import Movement

    existing = {row[0] for row in db.query(Movement.lot_id).distinct().all() if row[0]}
    created = 0
    lots = db.query(Lot).all()
    for lot in lots:
        if lot.id in existing:
            continue
        qty = float(getattr(lot, "initial_qty", None) or getattr(lot, "current_qty", 0) or 0)
        if qty <= 0:
            continue
        result = write_movement(
            db,
            lot_id=lot.id,
            user_id=user_id,
            qty=qty,
            destination=getattr(lot, "location", None) or "Almacén central",
            notes="Recepción (kardex reconstruido)",
            kinds=("ingreso", "entrada", "ajuste"),
        )
        if result == "ok":
            created += 1
            existing.add(lot.id)
    return created
