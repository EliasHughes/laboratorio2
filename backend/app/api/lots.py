from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_permission, create_audit_log, get_client_ip
from app.models.user import User
from app.repositories.lot_repo import LotRepository
from app.repositories.product_repo import ProductRepository
from app.schemas.lot import LotCreate, LotUpdate, LotOut

router = APIRouter(prefix="/lots", tags=["Lots"])


def enrich_lot(lot, db: Session = None) -> LotOut:
    stocks = []
    if db is not None:
        try:
            from app.services.stock import stocks_payload
            stocks = stocks_payload(db, lot)
        except Exception:
            stocks = []
    return LotOut(
        id=lot.id,
        product_id=lot.product_id,
        product_name=lot.product.name if lot.product else None,
        product_code=lot.product.code if lot.product else None,
        lot_number=lot.lot_number,
        initial_qty=lot.initial_qty,
        current_qty=lot.current_qty,
        expiration_date=lot.expiry_date,
        received_date=lot.arrival_date,
        status=lot.status.value if hasattr(lot.status, "value") else str(lot.status),
        notes=lot.notes,
        location=lot.location,
        coa_number=lot.coa_number,
        created_at=lot.created_at,
        stocks=stocks,
    )


@router.get("", response_model=List[LotOut])
def list_lots(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = Query(None, alias="status"),
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "view")),
):
    lots = LotRepository.get_all(db, skip=skip, limit=limit, status=status_filter, product_id=product_id)
    return [enrich_lot(lot) for lot in lots ]


@router.get("/{lot_id}", response_model=LotOut)
def get_lot(
    lot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "view")),
):
    lot = LotRepository.get_by_id(db, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return enrich_lot(lot)


@router.post("", response_model=LotOut, status_code=status.HTTP_201_CREATED)
def create_lot(
    obj_in: LotCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "create")),
):
    if not ProductRepository.get_by_id(db, obj_in.product_id):
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if LotRepository.get_by_lot_number(db, obj_in.lot_number):
        raise HTTPException(status_code=400, detail="El número de lote ya existe")

    try:
        lot = LotRepository.create(db, obj_in)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear lote: {str(e)}")

    try:
        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity="Lot",
            entity_id=lot.id,
            details=f"Lote creado: {lot.lot_number} | Cantidad: {lot.initial_qty}",
            ip_address=get_client_ip(request),
        )
    except Exception:
        pass  # no bloquear la recepción por auditoría

    return enrich_lot(lot)


@router.put("/{lot_id}", response_model=LotOut)
def update_lot(
    lot_id: int,
    obj_in: LotUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "edit")),
):
    lot = LotRepository.get_by_id(db, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    lot = LotRepository.update(db, lot, obj_in)

    create_audit_log(
        db=db,
        user=current_user,
        action="UPDATE",
        entity="Lot",
        entity_id=lot.id,
        details=f"Lote actualizado: {lot.lot_number}",
        ip_address=get_client_ip(request),
    )
    return enrich_lot(lot)


@router.delete("/{lot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lot(
    lot_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "delete")),
):
    lot = LotRepository.get_by_id(db, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    LotRepository.delete(db, lot)

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE",
        entity="Lot",
        entity_id=lot_id,
        details=f"Lote eliminado: {lot.lot_number}",
        ip_address=get_client_ip(request),
    )

@router.get("/{lot_id}/ficha")
def ficha_lote(
    lot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "view")),
):
    lot = LotRepository.get_by_id(db, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    from app.models.form_record import FormRecord
    from app.models.movement import Movement
    from app.services.stock import stocks_payload

    forms = (
        db.query(FormRecord)
        .filter((FormRecord.lot_id == lot.id) | (FormRecord.lot_number == lot.lot_number))
        .order_by(FormRecord.id.desc())
        .all()
    )
    movs = (
        db.query(Movement)
        .filter(Movement.lot_id == lot.id)
        .order_by(Movement.id.desc())
        .limit(50)
        .all()
    )
    return {
        "lot": enrich_lot(lot, db),
        "stocks": stocks_payload(db, lot),
        "forms": [
            {
                "id": f.id,
                "form_code": f.form_code,
                "form_type": f.form_type,
                "title": f.title,
                "status": f.status,
                "lot_number": f.lot_number,
            }
            for f in forms
        ],
        "movements": [
            {
                "id": m.id,
                "type": getattr(m.type, "value", m.type),
                "qty": m.qty,
                "reason": getattr(m, "reason", None),
                "created_at": m.created_at.isoformat() if getattr(m, "created_at", None) else None,
            }
            for m in movs
        ],
    }

