from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.lot import Lot

router = APIRouter(prefix="/withdrawals", tags=["Withdrawals"])


class WithdrawalCreate(BaseModel):
    product_id: int
    lot_id: int
    quantity: float = Field(..., gt=0)
    reason: Optional[str] = "Uso en análisis"
    destination: Optional[str] = "Laboratorio"
    notes: Optional[str] = None


@router.get("/lots/{product_id}")
def fefo_lots(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lotes disponibles del producto, FEFO (vence antes primero)."""
    lots = (
        db.query(Lot)
        .filter(Lot.product_id == product_id)
        .order_by(Lot.expiry_date.asc())
        .all()
    )
    out = []
    for lot in lots:
        qty = float(getattr(lot, "current_qty", 0) or 0)
        st = (getattr(lot, "status", "") or "").lower()
        if qty <= 0 or st in ("vencido", "agotado", "cuarentena"):
            continue
        out.append(
            {
                "id": lot.id,
                "lot_number": lot.lot_number,
                "current_qty": qty,
                "expiry_date": lot.expiry_date,
                "location": getattr(lot, "location", None),
                "status": getattr(lot, "status", None),
                "suggested": len(out) == 0,
            }
        )
    return out


@router.post("", status_code=status.HTTP_201_CREATED)
def create_withdrawal(
    body: WithdrawalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == body.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    lot = db.query(Lot).filter(Lot.id == body.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    if lot.product_id != body.product_id:
        raise HTTPException(status_code=400, detail="El lote no pertenece a ese producto")

    available = float(getattr(lot, "current_qty", 0) or 0)
    st = (getattr(lot, "status", "") or "").lower()
    if st in ("vencido", "cuarentena"):
        raise HTTPException(
            status_code=400,
            detail=f"No se puede retirar un lote en estado '{lot.status}'",
        )
    if body.quantity > available:
        raise HTTPException(
            status_code=400,
            detail=f"Cantidad mayor al disponible ({available})",
        )

    now = datetime.utcnow()
    new_qty = available - float(body.quantity)
    lot.current_qty = new_qty
    if new_qty <= 0:
        lot.status = "agotado"
    if hasattr(lot, "updated_at"):
        lot.updated_at = now

    try:
        db.commit()
        db.refresh(lot)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"No se pudo actualizar el lote: {e}")

    # Kardex opcional: no revierte el retiro si falla
    try:
        from app.models.movement import Movement

        mov = Movement()
        if hasattr(mov, "lot_id"):
            mov.lot_id = lot.id
        if hasattr(mov, "product_id"):
            mov.product_id = body.product_id
        if hasattr(mov, "movement_type"):
            mov.movement_type = "salida"
        if hasattr(mov, "type"):
            mov.type = "salida"
        if hasattr(mov, "qty"):
            mov.qty = body.quantity
        if hasattr(mov, "quantity"):
            mov.quantity = body.quantity
        if hasattr(mov, "reason"):
            mov.reason = body.reason
        if hasattr(mov, "destination"):
            mov.destination = body.destination
        if hasattr(mov, "notes"):
            mov.notes = body.notes
        if hasattr(mov, "user_id"):
            mov.user_id = current_user.id
        if hasattr(mov, "created_by"):
            mov.created_by = current_user.id
        if hasattr(mov, "created_at"):
            mov.created_at = now
        db.add(mov)
        db.commit()
    except Exception:
        db.rollback()

    try:
        from app.api.deps import create_audit_log

        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity="Withdrawal",
            entity_id=lot.id,
            details=(
                f"Retiro {body.quantity} de lote {lot.lot_number} "
                f"({product.name}) → {body.destination}"
            ),
            ip_address=None,
        )
        db.commit()
    except Exception:
        db.rollback()

    return {
        "ok": True,
        "lot_id": lot.id,
        "lot_number": lot.lot_number,
        "qty_withdrawn": body.quantity,
        "qty_remaining": float(lot.current_qty or 0),
        "status": lot.status,
    }