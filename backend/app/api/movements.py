from datetime import datetime

from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, create_audit_log, get_client_ip
from app.models.user import User
from app.models.lot import Lot
from app.models.movement import Movement
from app.models.product import Product

router = APIRouter(prefix="/movements", tags=["Movements"])


def _set_if_has(obj, field: str, value):
    if value is None:
        return
    if hasattr(obj, field):
        setattr(obj, field, value)


def _num(v, default=None):
    if v is None or v == "":
        return default
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


@router.get("/fefo/{product_id}")
def fefo_lots(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lots = (
        db.query(Lot)
        .filter(Lot.product_id == product_id)
        .order_by(Lot.expiry_date.asc())
        .all()
    )
    out = []
    for lot in lots:
        loc = (getattr(lot, "location", "") or "").strip().lower()
        usable = loc.startswith("laboratorio") or loc.startswith("refrigerado")
        if qty <= 0 or st in ("vencido", "agotado", "cuarentena") or not usable:
            continue
        out.append(
            {
                "id": lot.id,
                "lot_id": lot.id,
                "lot_number": lot.lot_number,
                "lot_code": lot.lot_number,
                "current_qty": qty,
                "quantity": qty,
                "expiry_date": lot.expiry_date,
                "location": getattr(lot, "location", None),
                "status": getattr(lot, "status", None),
                "suggested": len(out) == 0,
            }
        )
    return out


@router.post("", status_code=status.HTTP_201_CREATED)
def create_withdrawal(
    payload: dict = Body(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    lot_id = (
        payload.get("lot_id")
        or payload.get("lotId")
        or payload.get("lote_id")
        or payload.get("id")
    )
    quantity = _num(
        payload.get("quantity")
        or payload.get("qty")
        or payload.get("cantidad")
        or payload.get("amount")
    )
    reason = payload.get("reason") or payload.get("motivo")
    destination = payload.get("destination") or payload.get("destino")
    notes = payload.get("notes") or payload.get("nota") or payload.get("observaciones")

    if not lot_id:
        raise HTTPException(status_code=400, detail=f"Falta lot_id. Recibido: {list(payload.keys())}")
    if not quantity or quantity <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")

    lot_id = int(lot_id)
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    product_id = payload.get("product_id") or payload.get("productId") or lot.product_id
    product_id = int(product_id)
    if lot.product_id != product_id:
        raise HTTPException(status_code=400, detail="El lote no pertenece a ese producto")
   
    available = float(getattr(lot, "current_qty", 0) or 0)
    st = (getattr(lot, "status", "") or "").lower()
    if st in ("vencido", "cuarentena"):
        raise HTTPException(status_code=400, detail=f"No se puede retirar un lote '{lot.status}'")
    loc = (getattr(lot, "location", "") or "").strip().lower()
    if not (loc.startswith("laboratorio") or loc.startswith("refrigerado")):
        raise HTTPException(
            status_code=400,
            detail="El lote está en almacén. Transfiérelo a Laboratorio antes de usarlo.",
        )
    if quantity > available:
        raise HTTPException(status_code=400, detail=f"Cantidad mayor al disponible ({available})")

    now = datetime.utcnow()
    lot.current_qty = available - quantity
    if float(lot.current_qty or 0) <= 0:
        lot.status = "agotado"
    if hasattr(lot, "updated_at"):
        lot.updated_at = now

    movement = Movement()
    _set_if_has(movement, "lot_id", lot.id)
    _set_if_has(movement, "product_id", lot.product_id)
    _set_if_has(movement, "movement_type", "salida")
    _set_if_has(movement, "type", "salida")
    _set_if_has(movement, "qty", quantity)
    _set_if_has(movement, "quantity", quantity)
    _set_if_has(movement, "destination", destination)
    _set_if_has(movement, "user_id", current_user.id)
    _set_if_has(movement, "created_by", current_user.id)
    _set_if_has(movement, "created_at", now)
    note_parts = [p for p in (reason, destination, notes) if p]
    _set_if_has(movement, "notes", " · ".join(note_parts) if note_parts else None)

    db.add(movement)
    try:
        db.commit()
        db.refresh(lot)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"No se pudo registrar el retiro: {e}")

    try:
        product = db.query(Product).filter(Product.id == lot.product_id).first()
        pname = product.name if product else str(lot.product_id)
        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity="Movement",
            entity_id=getattr(movement, "id", lot.id),
            details=f"Retiro {quantity} lote {lot.lot_number} · {pname}",
            ip_address=get_client_ip(request) if request else None,
        )
        db.commit()
    except Exception:
        db.rollback()

    return {
        "ok": True,
        "lot_id": lot.id,
        "lot_number": lot.lot_number,
        "qty_withdrawn": quantity,
        "qty_remaining": float(lot.current_qty or 0),
        "status": lot.status,
    }


@router.get("")
def list_movements(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Movement)
        .order_by(Movement.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    out = []
    for m in rows:
        lot = db.query(Lot).filter(Lot.id == getattr(m, "lot_id", None)).first() if getattr(m, "lot_id", None) else None
        product = None
        pid = getattr(m, "product_id", None) or (lot.product_id if lot else None)
        if pid:
            product = db.query(Product).filter(Product.id == pid).first()
        uid = getattr(m, "user_id", None) or getattr(m, "created_by", None)
        user = db.query(User).filter(User.id == uid).first() if uid else None
        qty = getattr(m, "qty", None)
        if qty is None:
            qty = getattr(m, "quantity", None)
        out.append(
            {
                "id": m.id,
                "type": getattr(m, "movement_type", None) or getattr(m, "type", None) or "salida",
                "qty": float(qty or 0),
                "lot_number": getattr(lot, "lot_number", None) if lot else None,
                "product_name": getattr(product, "name", None) if product else None,
                "product_code": getattr(product, "code", None) if product else None,
                "notes": getattr(m, "notes", None),
                "destination": getattr(m, "destination", None),
                "username": getattr(user, "username", None) if user else None,
                "full_name": getattr(user, "full_name", None) if user else None,
                "created_at": getattr(m, "created_at", None),
            }
        )
    return out

@router.post("/transfer")
def transfer_lot(
    payload: dict = Body(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lot_id = payload.get("lot_id") or payload.get("lotId")
    to_location = (payload.get("to_location") or payload.get("location") or "").strip()
    qty = _num(payload.get("quantity") or payload.get("qty"))
    notes = payload.get("notes")
    reason = payload.get("reason") or "Despacho a laboratorio"

    if not lot_id:
        raise HTTPException(status_code=400, detail="Falta lot_id")
    if not to_location:
        raise HTTPException(status_code=400, detail="Falta ubicación destino")
    if not qty or qty <= 0:
        raise HTTPException(status_code=400, detail="Indica la cantidad a transferir")

    lot = db.query(Lot).filter(Lot.id == int(lot_id)).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    from_loc = getattr(lot, "location", None) or "—"
    if from_loc == to_location:
        raise HTTPException(status_code=400, detail="El lote ya está en esa ubicación")

    available = float(getattr(lot, "current_qty", 0) or 0)
    if qty > available:
        raise HTTPException(status_code=400, detail=f"Solo hay {available} disponibles en origen")

    dest = to_location.lower()
    st = str(getattr(lot.status, "value", lot.status) or "").lower()
    to_lab = dest.startswith("laboratorio") or dest.startswith("refrigerado")

    if to_lab and "vencido" in st:
        raise HTTPException(status_code=400, detail="No se envía a lab un lote vencido")

    # Cuarentena → lab = liberación (el split de abajo crea el lote destino)
    release = to_lab and "cuarentena" in st
    now = datetime.utcnow()
    dest_lot = lot

    if qty < available:
        lot.current_qty = available - qty
        if hasattr(lot, "updated_at"):
            lot.updated_at = now
        dest_lot = Lot()
        dest_lot.product_id = lot.product_id
        dest_lot.lot_number = f"{lot.lot_number}-{to_location[:3].upper()}"
        dest_lot.initial_qty = qty
        dest_lot.current_qty = qty
        dest_lot.expiry_date = lot.expiry_date
        dest_lot.arrival_date = getattr(lot, "arrival_date", None)
        dest_lot.location = to_location
        dest_lot.status = lot.status
        if release:
            dest_lot.status = "disponible"
        dest_lot.notes = f"Traspaso desde {from_loc} / lote origen {lot.lot_number}"
        if hasattr(dest_lot, "coa_number") and hasattr(lot, "coa_number"):
            dest_lot.coa_number = lot.coa_number
        if hasattr(dest_lot, "created_at"):
            dest_lot.created_at = now
        if hasattr(dest_lot, "updated_at"):
            dest_lot.updated_at = now
        db.add(dest_lot)
    else:
        lot.location = to_location
        if hasattr(lot, "updated_at"):
            lot.updated_at = now
        if release:
            lot.status = "disponible"

    movement = Movement()
    _set_if_has(movement, "lot_id", dest_lot.id if dest_lot.id else lot.id)
    _set_if_has(movement, "product_id", lot.product_id)
    _set_if_has(movement, "movement_type", "transferencia")
    _set_if_has(movement, "type", "transferencia")
    _set_if_has(movement, "qty", qty)
    _set_if_has(movement, "quantity", qty)
    _set_if_has(movement, "destination", to_location)
    _set_if_has(movement, "user_id", current_user.id)
    _set_if_has(movement, "created_by", current_user.id)
    _set_if_has(movement, "created_at", now)
    _set_if_has(
        movement,
        "notes",
        f"{reason} · {qty} · {from_loc} → {to_location}" + (f" · {notes}" if notes else ""),
    )
    db.add(movement)

    try:
        db.commit()
        db.refresh(lot)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"No se pudo transferir: {e}")

    return {
        "ok": True,
        "lot_id": lot.id,
        "lot_number": lot.lot_number,
        "qty": qty,
        "from_location": from_loc,
        "to_location": to_location,
    }