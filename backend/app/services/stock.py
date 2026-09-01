from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app.models.lot import Lot
from app.models.lot_stock import LotStock


def _now():
    return datetime.utcnow()


def list_stocks(db: Session, lot_id: int) -> List[LotStock]:
    return db.query(LotStock).filter(LotStock.lot_id == lot_id).all()


def stocks_payload(db: Session, lot: Lot):
    rows = ensure_stock(db, lot)
    return [{"location": r.location, "qty": float(r.qty or 0)} for r in rows if float(r.qty or 0) > 0]


def qty_at(db: Session, lot: Lot, location: str) -> float:
    loc = (location or "").strip()
    for r in ensure_stock(db, lot):
        if (r.location or "").strip().lower() == loc.lower():
            return float(r.qty or 0)
    return 0.0


def qty_in_sites(db: Session, lot: Lot, prefixes: tuple) -> float:
    total = 0.0
    for r in ensure_stock(db, lot):
        loc = (r.location or "").strip().lower()
        if any(loc.startswith(p) for p in prefixes):
            total += float(r.qty or 0)
    return total


def ensure_stock(db: Session, lot: Lot) -> List[LotStock]:
    rows = db.query(LotStock).filter(LotStock.lot_id == lot.id).all()
    if rows:
        return rows
    loc = (getattr(lot, "location", None) or "Almacén central").strip()
    if loc.lower() == "varias":
        loc = "Almacén central"
    row = LotStock(
        lot_id=lot.id,
        location=loc,
        qty=float(getattr(lot, "current_qty", 0) or 0),
        created_at=_now(),
        updated_at=_now(),
    )
    db.add(row)
    try:
        db.commit()
        db.refresh(row)
    except Exception:
        db.rollback()
        rows = db.query(LotStock).filter(LotStock.lot_id == lot.id).all()
        if rows:
            return rows
        raise
    return [row]


def _get_or_create(db: Session, lot_id: int, location: str) -> LotStock:
    loc = (location or "Almacén central").strip()
    if loc.lower() == "varias":
        loc = "Almacén central"
    row = (
        db.query(LotStock)
        .filter(LotStock.lot_id == lot_id, LotStock.location == loc)
        .first()
    )
    if row:
        return row
    row = LotStock(lot_id=lot_id, location=loc, qty=0, created_at=_now(), updated_at=_now())
    db.add(row)
    db.flush()
    return row


def set_total(db: Session, lot: Lot):
    rows = db.query(LotStock).filter(LotStock.lot_id == lot.id).all()
    for r in rows:
        if (r.location or "").strip().lower() == "varias":
            r.location = "Almacén central"
    total = sum(float(r.qty or 0) for r in rows)
    lot.current_qty = total
    nonempty = [r for r in rows if float(r.qty or 0) > 0]
    if nonempty:
        nonempty.sort(key=lambda r: float(r.qty or 0), reverse=True)
        lot.location = nonempty[0].location
    lot.updated_at = _now()


def add_stock(db: Session, lot: Lot, location: str, qty: float):
    ensure_stock(db, lot)
    row = _get_or_create(db, lot.id, location)
    row.qty = float(row.qty or 0) + float(qty)
    row.updated_at = _now()
    set_total(db, lot)


def consume_stock(db: Session, lot: Lot, location: str, qty: float):
    qty = float(qty)
    ensure_stock(db, lot)
    row = _get_or_create(db, lot.id, location)
    available = float(row.qty or 0)
    if qty > available:
        raise ValueError(f"En {location} solo hay {available}")
    row.qty = available - qty
    row.updated_at = _now()
    set_total(db, lot)
    return row


def move_stock(db: Session, lot: Lot, source: str, dest: str, qty: float):
    qty = float(qty)
    if qty <= 0:
        raise ValueError("Cantidad inválida")
    ensure_stock(db, lot)
    src = _get_or_create(db, lot.id, source)
    available = float(src.qty or 0)
    if qty > available:
        raise ValueError(f"En {source} solo hay {available}")
    dst = _get_or_create(db, lot.id, dest)
    src.qty = available - qty
    dst.qty = float(dst.qty or 0) + qty
    src.updated_at = _now()
    dst.updated_at = _now()
    set_total(db, lot)
    return src, dst