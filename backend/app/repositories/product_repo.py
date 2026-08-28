from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.product import Product
from app.models.lot import Lot
from app.schemas.product import ProductCreate, ProductUpdate


class ProductRepository:

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 200) -> List[Product]:
        return (
            db.query(Product)
            .order_by(Product.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_by_code(db: Session, code: str) -> Optional[Product]:
        return db.query(Product).filter(Product.code == code.strip()).first()

    @staticmethod
    def get_current_stock(db: Session, product_id: int) -> float:
        """Suma current_qty de lotes del producto."""
        total = (
            db.query(func.coalesce(func.sum(Lot.current_qty), 0))
            .filter(Lot.product_id == product_id)
            .scalar()
        )
        try:
            return float(total or 0)
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def create(db: Session, data: ProductCreate) -> Product:
        # SQL Server: datetime SIN timezone (evita Conversion failed)
        now = datetime.utcnow()

        product = Product(
            code=data.code.strip(),
            name=data.name.strip(),
            category=getattr(data, "category", None) or None,
            unit=getattr(data, "unit", None) or "und",
            min_stock=getattr(data, "min_stock", None) or 0,
            description=getattr(data, "description", None) or None,
            is_active=True if getattr(data, "is_active", None) is None else data.is_active,
        )

        # Solo asignar timestamps si el modelo los tiene y no usan server_default
        if hasattr(Product, "created_at"):
            product.created_at = now
        if hasattr(Product, "updated_at"):
            product.updated_at = now

        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update(db: Session, product: Product, data: ProductUpdate) -> Product:
        payload = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else data.dict(exclude_unset=True)

        for field, value in payload.items():
            if field in ("created_at", "updated_at"):
                continue
            setattr(product, field, value)

        if hasattr(product, "updated_at"):
            product.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product: Product) -> None:
        # Soft delete si existe is_active
        if hasattr(product, "is_active"):
            product.is_active = False
            if hasattr(product, "updated_at"):
                product.updated_at = datetime.utcnow()
            db.commit()
        else:
            db.delete(product)
            db.commit()