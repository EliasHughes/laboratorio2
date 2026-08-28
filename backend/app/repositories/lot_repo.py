from datetime import date, timedelta
from sqlalchemy.orm import Session, joinedload
from app.models.lot import Lot, LotStatus
from app.schemas.lot import LotCreate, LotUpdate

class LotRepository:

    @staticmethod
    def _compute_status(expiry_date: date, current_status: str | None = None) -> str:
        if current_status == "cuarentena":
            return "cuarentena"
        today = date.today()
        if expiry_date < today:
            return "vencido"
        if expiry_date <= today + timedelta(days=30):
            return "por_vencer"
        return "disponible"

    @staticmethod
    def get_all(db: Session, skip=0, limit=100, status=None, product_id=None):
        q = db.query(Lot).options(joinedload(Lot.product))
        if product_id:
            q = q.filter(Lot.product_id == product_id)
        if status:
            q = q.filter(Lot.status == status)
        return q.order_by(Lot.expiry_date.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, lot_id: int):
        return (
            db.query(Lot)
            .options(joinedload(Lot.product))
            .filter(Lot.id == lot_id)
            .first()
        )

    @staticmethod
    def get_by_lot_number(db: Session, lot_number: str):
        return db.query(Lot).filter(Lot.lot_number == lot_number).first()

    @staticmethod
    def create(db: Session, data: LotCreate) -> Lot:
        expiry = data.expiration_date  # del schema de entrada
        status = LotRepository._compute_status(
            expiry,
            data.status.value if getattr(data, "status", None) else None,
        )
        lot = Lot(
            product_id=data.product_id,
            lot_number=data.lot_number,
            initial_qty=data.initial_qty,
            current_qty=data.current_qty if data.current_qty is not None else data.initial_qty,
            expiry_date=expiry,
            arrival_date=data.received_date or date.today(),
            location=getattr(data, "location", None),
            status=LotStatus(status),
            coa_number=getattr(data, "coa_number", None),
            notes=data.notes,
        )
        db.add(lot)
        db.commit()
        db.refresh(lot)
        return LotRepository.get_by_id(db, lot.id)

    @staticmethod
    def update(db: Session, lot: Lot, data: LotUpdate) -> Lot:
        payload = data.model_dump(exclude_unset=True)
        # Mapear nombres del schema → columnas BD
        if "expiration_date" in payload:
            lot.expiry_date = payload.pop("expiration_date")
        if "received_date" in payload:
            lot.arrival_date = payload.pop("received_date")
        for field, value in payload.items():
            if hasattr(lot, field):
                setattr(lot, field, value)
        lot.status = LotStatus(
            LotRepository._compute_status(lot.expiry_date, lot.status.value if lot.status else None)
        )
        db.commit()
        db.refresh(lot)
        return LotRepository.get_by_id(db, lot.id)

    @staticmethod
    def delete(db: Session, lot: Lot) -> None:
        db.delete(lot)
        db.commit()