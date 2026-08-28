from datetime import datetime
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supplier import Supplier
from app.models.purchase_order import PurchaseOrder, PurchaseOrderLine
from app.models.product import Product

from datetime import datetime, timedelta
from app.models.lot import Lot
from datetime import datetime, timedelta
from app.models.lot import Lot




router = APIRouter(prefix="/purchases", tags=["Compras"])


@router.get("/suppliers")
def list_suppliers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(Supplier).order_by(Supplier.name).all()
    return [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "rnc": s.rnc,
            "phone": s.phone,
            "email": s.email,
            "active": s.active,
        }
        for s in rows
    ]


@router.post("/suppliers")
def create_supplier(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = (payload.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Nombre requerido")
    code = (payload.get("code") or f"PRV-{int(datetime.utcnow().timestamp())}").strip()
    if db.query(Supplier).filter(Supplier.code == code).first():
        raise HTTPException(status_code=400, detail="Código ya existe")
    s = Supplier(
        code=code,
        name=name,
        rnc=payload.get("rnc"),
        phone=payload.get("phone"),
        email=payload.get("email"),
        notes=payload.get("notes"),
        active=True,
        created_at=datetime.utcnow(),
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"ok": True, "id": s.id}


@router.get("/orders")
def list_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(PurchaseOrder).order_by(PurchaseOrder.id.desc()).limit(100).all()
    out = []
    for po in rows:
        sup = db.query(Supplier).filter(Supplier.id == po.supplier_id).first()
        lines = db.query(PurchaseOrderLine).filter(PurchaseOrderLine.po_id == po.id).all()
        out.append(
            {
                "id": po.id,
                "number": po.number,
                "status": po.status,
                "currency": po.currency,
                "notes": po.notes,
                "supplier_name": getattr(sup, "name", None),
                "lines": [
                    {"id": ln.id, "description": ln.description, "qty": ln.qty, "qty_received": ln.qty_received, "unit_price": ln.unit_price}
                    for ln in lines
                ],
            }
        )
    return out


@router.post("/orders")
def create_order(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    supplier_id = payload.get("supplier_id")
    if not supplier_id:
        raise HTTPException(status_code=400, detail="Proveedor requerido")
    number = (payload.get("number") or f"OC-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}").strip()
    po = PurchaseOrder(
        number=number,
        supplier_id=int(supplier_id),
        status="draft",
        currency=payload.get("currency") or "DOP",
        notes=payload.get("notes"),
        created_by=current_user.id,
        created_at=datetime.utcnow(),
    )
    db.add(po)
    db.flush()
    for raw in payload.get("lines") or []:
        pid = raw.get("product_id")
        prod = db.query(Product).filter(Product.id == int(pid)).first() if pid else None
        db.add(
            PurchaseOrderLine(
                po_id=po.id,
                product_id=pid,
                description=raw.get("description") or getattr(prod, "name", ""),
                qty=float(raw.get("qty") or 0),
                unit_price=float(raw.get("unit_price") or 0),
            )
        )
    db.commit()
    db.refresh(po)
    return {"ok": True, "id": po.id, "number": po.number}

@router.post("/orders/{po_id}/receive")
def receive_order(
    po_id: int,
    payload: dict = Body(default={}),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timedelta
    from app.models.lot import Lot

    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="OC no existe")
    if (po.status or "").lower() in ("received", "cancelled"):
        raise HTTPException(status_code=400, detail="OC cerrada")

    lines = db.query(PurchaseOrderLine).filter(PurchaseOrderLine.po_id == po.id).all()
    dest = (payload.get("location") or "Cuarentena").strip()
    now = datetime.utcnow()
    created = []

    for ln in lines:
        qty = float(getattr(ln, "qty", 0) or 0) - float(getattr(ln, "qty_received", 0) or 0)
        if qty <= 0:
            continue
        code = f"OC{po.id}-L{ln.id}-{int(now.timestamp())}"
        lot = Lot()
        for col in Lot.__table__.columns:
            name = col.name
            if name == "id":
                continue
            val = None
            if name == "product_id":
                val = ln.product_id
            elif name in ("initial_qty", "current_qty", "qty", "quantity"):
                val = qty
            elif name in ("lot_number", "code", "batch_number"):
                val = code
            elif name == "location":
                val = dest
            elif name == "status":
                val = "cuarentena"
            elif name in ("expiry_date", "expires_at"):
                val = now + timedelta(days=365)
                if "date" in name and hasattr(val, "date"):
                    try:
                        val = val.date()
                    except Exception:
                        pass
            elif name in ("created_at", "updated_at", "arrival_date"):
                val = now
            elif name == "notes":
                val = f"Recepcion OC {po.number}"
            elif name == "coa_number":
                val = None
            if val is not None:
                setattr(lot, name, val)
            elif not col.nullable:
                t = str(col.type).lower()
                if "int" in t or "num" in t or "float" in t or "dec" in t:
                    setattr(lot, name, 0)
                elif "date" in t:
                    setattr(lot, name, now)
                else:
                    setattr(lot, name, "")
        db.add(lot)
        if hasattr(ln, "qty_received"):
            ln.qty_received = float(getattr(ln, "qty", 0) or 0)
        created.append({"product_id": ln.product_id, "qty": qty, "code": code})

    po.status = "received"
    db.commit()
    return {"ok": True, "id": po.id, "status": po.status, "lots": created, "location": dest}