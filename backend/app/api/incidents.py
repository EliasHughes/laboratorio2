from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import require_permission, get_current_user
from app.models.user import User
from app.models.incident import Incident

router = APIRouter(prefix="/incidents", tags=["EHS"])


class IncidentIn(BaseModel):
    title: str
    area: Optional[str] = None
    severity: str = "media"
    description: Optional[str] = None
    lot_number: Optional[str] = None
    status: str = "abierto"


@router.get("")
def list_incidents(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("ehs", "view")),
):
    rows = db.query(Incident).order_by(Incident.id.desc()).limit(200).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "area": r.area,
            "severity": r.severity,
            "status": r.status,
            "description": r.description,
            "lot_number": r.lot_number,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.post("")
def create_incident(
    body: IncidentIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("ehs", "create")),
):
    row = Incident(
        title=body.title.strip(),
        area=body.area,
        severity=body.severity,
        status=body.status,
        description=body.description,
        lot_number=body.lot_number,
        created_by_id=user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "title": row.title, "status": row.status}


@router.put("/{incident_id}")
def update_incident(
    incident_id: int,
    body: IncidentIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("ehs", "edit")),
):
    row = db.query(Incident).filter(Incident.id == incident_id).first()
    if not row:
        raise HTTPException(404, "Incidente no encontrado")
    row.title = body.title.strip()
    row.area = body.area
    row.severity = body.severity
    row.status = body.status
    row.description = body.description
    row.lot_number = body.lot_number
    row.updated_at = datetime.utcnow()
    db.commit()
    return {"id": row.id, "status": row.status}