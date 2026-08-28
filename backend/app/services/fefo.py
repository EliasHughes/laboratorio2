from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.lot import Lot, LotStatus
from app.models.product import Product

class FEFOService:
    """
    First Expired, First Out
    Siempre selecciona el lote disponible no vencido con la fecha de vencimiento más cercana.
    """

    @staticmethod
    def get_best_lot(db: Session, product_id: int) -> Lot:
        today = date.today()

        lot = (
            db.query(Lot)
            .filter(
                Lot.product_id == product_id,
                Lot.status == LotStatus.disponible,
                Lot.current_qty > 0,
                Lot.expiry_date >= today,
            )
            .order_by(Lot.expiry_date.asc())  # el que vence primero
            .first()
        )

        if not lot:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay lotes disponibles y no vencidos para este producto (FEFO)",
            )
        return lot

    @staticmethod
    def validate_withdrawal(db: Session, product_id: int, qty: float) -> Lot:
        lot = FEFOService.get_best_lot(db, product_id)

        if qty > lot.current_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cantidad solicitada ({qty}) supera el stock del lote FEFO ({lot.current_qty}) - Lote: {lot.lot_number}",
            )
        return lot