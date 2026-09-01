from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.lot import Lot

router = APIRouter(prefix="/receiving", tags=["Receiving"])


class ReceivingCreate(BaseModel):
    product_id: int
    lot_code: str = Field(..., min_length=1, max_length=100)
    quantity: float = Field(..., gt=0)
    unit: Optional[str] = "und"
    expiry_date: Optional[date] = None
    arrival_date: Optional[date] = None
    supplier: Optional[str] = None
    invoice_ref: Optional[str] = None
    notes: Optional[str] = None
    location: Optional[str] = "Almacén central"


def _lot_status(expiry: Optional[date]) -> str:
    if not expiry:
        return "disponible"
    today = date.today()
    if expiry < today:
        return "vencido"
    if (expiry - today).days <= 30:
        return "por_vencer"
    return "disponible"


def _serialize_lot(lot: Lot, product: Optional[Product] = None) -> dict:
    prod = product or getattr(lot, "product", None)
    qty = getattr(lot, "current_qty", None)
    if qty is None:
        qty = getattr(lot, "initial_qty", 0) or 0
    return {
        "id": lot.id,
        "product_id": lot.product_id,
        "product_name": getattr(prod, "name", None) if prod else None,
        "lot_code": getattr(lot, "lot_number", None) or "",
        "lot_number": getattr(lot, "lot_number", None) or "",
        "quantity": float(qty or 0),
        "unit": getattr(prod, "unit", None) if prod else None,
        "expiry_date": getattr(lot, "expiry_date", None),
        "arrival_date": getattr(lot, "arrival_date", None),
        "status": getattr(lot, "status", None),
        "location": getattr(lot, "location", None),
        "coa_number": getattr(lot, "coa_number", None),
        "notes": getattr(lot, "notes", None),
    }


@router.get("/recent")
def list_recent(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50,
):
    lots = db.query(Lot).order_by(Lot.id.desc()).limit(limit).all()
    return [_serialize_lot(l) for l in lots]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_receiving(
    body: ReceivingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == body.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    lot_number = body.lot_code.strip()

    existing = (
        db.query(Lot)
        .filter(Lot.product_id == body.product_id, Lot.lot_number == lot_number)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe el lote '{lot_number}' para este producto",
        )

    now = datetime.utcnow()
    arrival = body.arrival_date or date.today()
    expiry = body.expiry_date or (arrival + timedelta(days=730))
    st = _lot_status(expiry)

    lot = Lot()
    lot.product_id = body.product_id
    lot.lot_number = lot_number
    lot.initial_qty = body.quantity
    lot.current_qty = body.quantity
    lot.expiry_date = expiry
    lot.arrival_date = arrival
    lot.location = body.location or "Almacén central"
    lot.status = st
    lot.notes = body.notes
    if hasattr(lot, "coa_number") and body.invoice_ref:
        lot.coa_number = body.invoice_ref
    if hasattr(lot, "created_at"):
        lot.created_at = now
    if hasattr(lot, "updated_at"):
        lot.updated_at = now

    db.add(lot)
    try:
        db.commit()
        db.refresh(lot)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo guardar el lote: {str(e)}",
        )

    from app.services.kardex import write_movement

    kardex_error = write_movement(
        db,
        lot_id=lot.id,
        user_id=current_user.id,
        qty=float(body.quantity),
        destination=body.location or "Almacén central",
        notes=body.notes or "Recepción / Ingreso",
        kinds=("ingreso", "entrada", "ajuste"),
    )
    if kardex_error == "ok":
        kardex_error = None

    try:
        from app.api.deps import create_audit_log

        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity="Lot",
            entity_id=lot.id,
            details=f"Recepción lote {lot_number} · qty {body.quantity} · {product.name}",
            ip_address=None,
        )
        db.commit()
    except Exception:
        db.rollback()

    data = _serialize_lot(lot, product)
    data["kardex"] = "ok" if not kardex_error else kardex_error
    return data