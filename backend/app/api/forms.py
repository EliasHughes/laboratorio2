import json
import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.form_record import FormRecord
from app.models.user import User
from app.schemas.form_record import FormRecordCreate, FormRecordUpdate, FormRecordOut
from app.api.deps import get_db, get_current_user

router = APIRouter(prefix="/forms", tags=["forms"])


def _uname(db: Session, uid):
    if not uid:
        return None
    u = db.query(User).filter(User.id == uid).first()
    if not u:
        return None
    return getattr(u, "full_name", None) or getattr(u, "name", None) or getattr(u, "username", None)


def _parse(raw):
    if raw is None:
        return {}
    if isinstance(raw, dict):
        return raw
    try:
        val = json.loads(raw)
        return val if isinstance(val, dict) else {"value": val}
    except Exception:
        return {"raw": str(raw)}


def _to_out(db: Session, row: FormRecord) -> FormRecordOut:
    data = _parse(getattr(row, "data_json", None))
    return FormRecordOut(
        id=row.id,
        form_type=row.form_type,
        form_code=row.form_code,
        title=row.title,
        data=data,
        payload=data,
        status=row.status or "borrador",
        created_by_id=getattr(row, "created_by_id", None),
        updated_by_id=getattr(row, "updated_by_id", None),
        created_by_name=_uname(db, getattr(row, "created_by_id", None)),
        updated_by_name=_uname(db, getattr(row, "updated_by_id", None)),
        created_at=getattr(row, "created_at", None),
        updated_at=getattr(row, "updated_at", None),
    )


@router.get("", response_model=list[FormRecordOut])
def list_forms(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        rows = db.query(FormRecord).order_by(FormRecord.id.desc()).all()
        return [_to_out(db, r) for r in rows]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=FormRecordOut)
def create_form(body: FormRecordCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    payload = body.data or body.payload or {}
    row = FormRecord(
        form_type=body.form_type,
        form_code=body.form_code,
        title=body.title,
        data_json=json.dumps(payload, ensure_ascii=False, default=str),
        status=body.status or "borrador",
        created_by_id=user.id,
        updated_by_id=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_out(db, row)


@router.put("/{form_id}", response_model=FormRecordOut)
def update_form(form_id: int, body: FormRecordUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = db.query(FormRecord).filter(FormRecord.id == form_id).first()
    if not row:
        raise HTTPException(404, "Formulario no encontrado")
    if body.title is not None:
        row.title = body.title
    if body.status is not None:
        row.status = body.status
    incoming = body.data if body.data is not None else body.payload
    if incoming is not None:
        row.data_json = json.dumps(incoming, ensure_ascii=False, default=str)
    row.updated_by_id = user.id
    db.commit()
    db.refresh(row)
    return _to_out(db, row)