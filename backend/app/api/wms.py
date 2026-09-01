from datetime import datetime
from fastapi import APIRouter, Body, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, create_audit_log, get_client_ip
from app.models.user import User
from app.models.lot import Lot
from app.models.product import Product
from app.models.wms_task import WmsTask

router = APIRouter(prefix="/wms", tags=["WMS"])


@router.get("/tasks")
def list_tasks(
    status: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(WmsTask)
    if status:
        q = q.filter(WmsTask.status == status)
    rows = q.order_by(WmsTask.id.desc()).limit(150).all()
    out = []
    for t in rows:
        lot = db.query(Lot).filter(Lot.id == t.lot_id).first() if t.lot_id else None
        prod = None
        if t.product_id:
            prod = db.query(Product).filter(Product.id == t.product_id).first()
        elif lot:
            prod = db.query(Product).filter(Product.id == lot.product_id).first()
        out.append(
            {
                "id": t.id,
                "task_type": t.task_type,
                "status": t.status,
                "product_id": t.product_id,
                "product_name": getattr(prod, "name", None),
                "product_code": getattr(prod, "code", None),
                "lot_id": t.lot_id,
                "lot_number": getattr(lot, "lot_number", None) or t.barcode,
                "from_location": t.from_location,
                "to_location": t.to_location,
                "qty_planned": t.qty_planned,
                "qty_done": t.qty_done,
                "barcode": t.barcode,
                "notes": t.notes,
            }
        )
    return out


@router.post("/tasks")
def create_task(
    payload: dict = Body(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ttype = (payload.get("task_type") or "transfer").strip().lower()
    if ttype not in ("receive", "putaway", "transfer", "pick", "count"):
        raise HTTPException(status_code=400, detail="task_type inválido")

    lot_id = payload.get("lot_id")
    lot = db.query(Lot).filter(Lot.id == int(lot_id)).first() if lot_id else None
    if not lot:
        raise HTTPException(status_code=400, detail="Selecciona un lote")

    qty = float(payload.get("qty") or payload.get("qty_planned") or 0)
    if qty <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")
    available = float(getattr(lot, "current_qty", 0) or 0)
    if qty > available:
        raise HTTPException(status_code=400, detail=f"El lote solo tiene {available}")

    dest = (payload.get("to_location") or "Laboratorio").strip()
    task = WmsTask(
        task_type=ttype,
        status="pending",
        product_id=lot.product_id,
        lot_id=lot.id,
        from_location=(payload.get("from_location") or getattr(lot, "location", None) or "Almacén central"),
        to_location=dest,
        qty_planned=qty,
        qty_done=0,
        barcode=lot.lot_number,
        notes=payload.get("notes"),
        created_by=current_user.id,
        assigned_to=current_user.id,
        created_at=datetime.utcnow(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    scan_status = "pending"
    try:
        scanned = scan_task(
            task.id,
            {"barcode": lot.lot_number, "qty": qty},
            request,
            db,
            current_user,
        )
        scan_status = scanned.get("status") or "done"
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Tarea creada pero no se completó: {e}")

    try:
        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity="WmsTask",
            entity_id=task.id,
            details=f"WMS {ttype} lote {lot.lot_number} qty={qty} → {dest}",
            ip_address=get_client_ip(request) if request else None,
        )
        db.commit()
    except Exception:
        db.rollback()
    return {"ok": True, "id": task.id, "status": scan_status, "lot_number": lot.lot_number}


@router.post("/tasks/{task_id}/scan")
def scan_task(
    task_id: int,
    payload: dict = Body(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(WmsTask).filter(WmsTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    if task.status in ("done", "cancelled"):
        raise HTTPException(status_code=400, detail="La tarea ya está cerrada")

    code = str(payload.get("barcode") or payload.get("scan") or "").strip()
    qty = float(payload.get("qty") or task.qty_planned or 0)
    if qty <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida. Indica la cantidad en la tarea.")

    lot = db.query(Lot).filter(Lot.id == task.lot_id).first() if task.lot_id else None
    if not lot and code:
        lot = db.query(Lot).filter(Lot.lot_number == code).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado en la tarea")

    expected = (lot.lot_number or "").strip()
    if code and expected and code.casefold() != expected.casefold():
        raise HTTPException(status_code=400, detail=f"El código no coincide. Esperado {expected}")

    dest = task.to_location or "Laboratorio"
    origin = (task.from_location or getattr(lot, "location", None) or "Almacén central").strip()
    now = datetime.utcnow()
    try:
        from app.services.stock import move_stock, qty_at

        available = qty_at(db, lot, origin)
        if available <= 0:
            available = float(getattr(lot, "current_qty", 0) or 0)
            origin = (getattr(lot, "location", None) or origin).strip()
        if qty > available:
            raise HTTPException(status_code=400, detail=f"En {origin} solo hay {available}")
        if task.task_type in ("transfer", "putaway", "receive") and origin.lower() != dest.lower():
            move_stock(db, lot, origin, dest, qty)
        lot.updated_at = now
        task.qty_done = float(task.qty_done or 0) + qty
        task.status = "done" if task.qty_done >= float(task.qty_planned or 0) else "in_progress"
        task.updated_at = now
        task.assigned_to = current_user.id
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"No se pudo mover el lote: {e}")

    from app.services.kardex import write_movement

    write_movement(
        db,
        lot_id=lot.id,
        user_id=current_user.id,
        qty=float(qty),
        destination=dest,
        notes=f"WMS {task.task_type} {lot.lot_number} {origin} → {dest}",
        kinds=("ajuste", "entrada", "ingreso", "transferencia", "transfer"),
    )

    return {
        "ok": True,
        "task_id": task.id,
        "status": task.status,
        "qty_done": task.qty_done,
        "lot_number": lot.lot_number,
        "to_location": dest,
    }