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
    lots = (
        db.query(Lot)
        .filter(Lot.product_id == product_id)
        .order_by(Lot.expiry_date.asc())
        .all()
    )
    out = []
    from app.services.stock import qty_in_sites

    for lot in lots:
        st = str(getattr(getattr(lot, "status", None), "value", getattr(lot, "status", "")) or "").lower()
        lab_qty = qty_in_sites(db, lot, ("laboratorio", "refrigerado"))
        if lab_qty <= 0 or st in ("vencido", "agotado", "cuarentena", "retenido"):
            continue
        out.append(
            {
                "id": lot.id,
                "lot_number": lot.lot_number,
                "current_qty": lab_qty,
                "expiry_date": lot.expiry_date,
                "location": "Laboratorio",
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

    st = str(getattr(getattr(lot, "status", None), "value", getattr(lot, "status", "")) or "").lower()
    if st in ("vencido", "cuarentena", "retenido", "agotado"):
        raise HTTPException(status_code=400, detail=f"No se puede retirar un lote en estado '{lot.status}'")

    from app.services.stock import qty_in_sites, qty_at, consume_stock

    lab_qty = qty_in_sites(db, lot, ("laboratorio", "refrigerado"))
    if lab_qty <= 0:
        raise HTTPException(
            status_code=400,
            detail="No hay cantidad de este lote en Laboratorio. Transfiérelo desde WMS.",
        )
    if body.quantity > lab_qty:
        raise HTTPException(status_code=400, detail=f"En Laboratorio solo hay {lab_qty}")

    site = "Laboratorio"
    if qty_at(db, lot, "Laboratorio") < float(body.quantity) and qty_at(db, lot, "Refrigerado") >= float(body.quantity):
        site = "Refrigerado"

    now = datetime.utcnow()
    try:
        consume_stock(db, lot, site, float(body.quantity))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if float(lot.current_qty or 0) <= 0:
        lot.status = "agotado"
    lot.updated_at = now

    try:
        db.commit()
        db.refresh(lot)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"No se pudo actualizar el lote: {e}")

    from app.services.kardex import write_movement

    write_movement(
        db,
        lot_id=lot.id,
        user_id=current_user.id,
        qty=float(body.quantity),
        destination=body.destination or "Laboratorio",
        notes=body.reason or body.notes or "Retiro",
        kinds=("retiro_analisis", "salida", "ajuste"),
    )

    try:
        from app.api.deps import create_audit_log

        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity="Withdrawal",
            entity_id=lot.id,
            details=f"Retiro {body.quantity} de lote {lot.lot_number} ({product.name})",
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