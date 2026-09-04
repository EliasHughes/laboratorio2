from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.permissions import has_permission
from app.models.form_record import FormRecord
from app.models.user import User
from app.api.forms import _to_out

router = APIRouter(prefix="/approvals", tags=["approvals"])


class DecideIn(BaseModel):
    action: str
    note: str | None = None


def _can_inbox(user: User) -> bool:
    return (
        has_permission(user, "approvals", "view")
        or has_permission(user, "forms", "view")
        or has_permission(user, "forms", "edit")
    )


def _can_decide(user: User) -> bool:
    return (
        has_permission(user, "approvals", "decide")
        or has_permission(user, "forms", "edit")
        or has_permission(user, "forms", "create")
    )


@router.get("/inbox")
def inbox(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not _can_inbox(user):
        raise HTTPException(403, "No tienes permiso para ver aprobaciones")
    rows = (
        db.query(FormRecord)
        .filter(
            (
                (FormRecord.supervisor_id == user.id)
                & (FormRecord.supervisor_status == "pending")
            )
            | (
                (FormRecord.manager_id == user.id)
                & (FormRecord.manager_status == "pending")
            )
        )
        .order_by(FormRecord.id.desc())
        .all()
    )
    return [_to_out(db, r) for r in rows]


@router.post("/{form_id}/decide")
def decide(
    form_id: int,
    body: DecideIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not _can_decide(user):
        raise HTTPException(403, "No tienes permiso para aprobar o rechazar")
    row = db.query(FormRecord).filter(FormRecord.id == form_id).first()
    if not row:
        raise HTTPException(404, "Formulario no encontrado")
    action = (body.action or "").lower()
    if action not in ("approve", "reject"):
        raise HTTPException(400, "action debe ser approve o reject")
    sig = getattr(user, "signature_data", None) or (user.full_name or user.username)

    if row.supervisor_id == user.id and row.supervisor_status == "pending":
        row.supervisor_status = "approved" if action == "approve" else "rejected"
        row.supervisor_note = body.note
        row.supervisor_signature = sig
        if action == "reject":
            row.status = "rechazado"
        elif row.manager_id:
            row.manager_status = "pending"
            row.status = "pendiente_gerente"
        else:
            row.status = "aprobado"
    elif row.manager_id == user.id and row.manager_status == "pending":
        row.manager_status = "approved" if action == "approve" else "rejected"
        row.manager_note = body.note
        row.manager_signature = sig
        row.status = "aprobado" if action == "approve" else "rechazado"
    else:
        raise HTTPException(403, "Este registro no está pendiente de tu firma")

    row.updated_by_id = user.id
    db.commit()
    db.refresh(row)
    return _to_out(db, row)