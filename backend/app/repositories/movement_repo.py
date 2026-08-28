from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.movement import Movement
from app.schemas.movement import MovementCreate

class MovementRepository:

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Movement]:
        return (
            db.query(Movement)
            .options(joinedload(Movement.lot), joinedload(Movement.user))
            .order_by(Movement.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(db: Session, obj_in: MovementCreate, user_id: int) -> Movement:
        db_obj = Movement(**obj_in.model_dump(), user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj