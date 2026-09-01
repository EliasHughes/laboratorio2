import json
import traceback
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.form_record import FormRecord
from app.models.user import User
from app.models.lot import Lot
from app.core.database import engine
from app.schemas.form_record import FormRecordCreate, FormRecordUpdate, FormRecordOut
from app.api.deps import get_db, get_current_user

router = APIRouter(prefix="/forms", tags=["forms"])


def _ensure_lot_columns():
    try:
        with engine.begin() as conn:
            conn.execute(text(
                """
                IF COL_LENGTH('form_records', 'lot_id') IS NULL
                    ALTER TABLE form_records ADD lot_id INT NULL
                """
            ))
            conn.execute(text(
                """
                IF COL_LENGTH('form_records', 'lot_number') IS NULL
                    ALTER TABLE form_records ADD lot_number NVARCHAR(80) NULL
                """
            ))
    except Exception:
        pass


_ensure_lot_columns()


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
        lot_id=getattr(row, "lot_id", None),
        lot_number=getattr(row, "lot_number", None) or data.get("lot_number") or data.get("lote"),
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
    lot_id = body.lot_id or payload.get("lot_id")
    lot_number = body.lot_number or payload.get("lot_number") or payload.get("lote")
    if lot_id and not lot_number:
        lot = db.query(Lot).filter(Lot.id == int(lot_id)).first()
        if lot:
            lot_number = lot.lot_number
    if isinstance(payload, dict):
        if lot_id:
            payload["lot_id"] = lot_id
        if lot_number:
            payload["lot_number"] = lot_number
    row = FormRecord(
        form_type=body.form_type,
        form_code=body.form_code,
        title=body.title,
        lot_id=int(lot_id) if lot_id else None,
        lot_number=lot_number,
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
        if isinstance(incoming, dict):
            if body.lot_id:
                incoming["lot_id"] = body.lot_id
            if body.lot_number:
                incoming["lot_number"] = body.lot_number
        row.data_json = json.dumps(incoming, ensure_ascii=False, default=str)
    if body.lot_id is not None:
        row.lot_id = body.lot_id
    if body.lot_number is not None:
        row.lot_number = body.lot_number
    row.updated_by_id = user.id
    db.commit()
    db.refresh(row)
    return _to_out(db, row)

import os
import uuid
from app.core.config import get_settings
from app.models.form_attachment import FormAttachment

PHOTO_TYPES = {
    "inspeccion_instalaciones",
    "inspeccion_isotanques",
    "inspeccion_contenedores_chasis",
}
PHOTO_CODES = {"Y-FO-SI-018", "Y-FO-BI-018", "Y-FO-CC-038", "Y-FO-SI-004"}
ALLOWED_IMG = {".jpg", ".jpeg", ".png", ".webp"}


def _photo_ok(row: FormRecord) -> bool:
    return (row.form_type or "") in PHOTO_TYPES or (row.form_code or "").upper() in PHOTO_CODES


@router.get("/{form_id}/attachments")
def list_attachments(form_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = (
        db.query(FormAttachment)
        .filter(FormAttachment.form_id == form_id)
        .order_by(FormAttachment.id.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "mime": r.mime,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]

def _evidence_root() -> str:
    raw = getattr(get_settings(), "EVIDENCE_ROOT", None) or r"C:\YazooData\evidencias"
    os.makedirs(raw, exist_ok=True)
    return raw

@router.post("/{form_id}/attachments")
async def upload_attachment(
    form_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    row = db.query(FormRecord).filter(FormRecord.id == form_id).first()
    if not row:
        raise HTTPException(404, "Formulario no encontrado")
    if not _photo_ok(row):
        raise HTTPException(400, "Este formulario no admite evidencias")
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    if ext not in ALLOWED_IMG:
        raise HTTPException(400, "Solo jpg, png o webp")
    root = _evidence_root()
    folder = os.path.join(root, str(form_id))
    os.makedirs(folder, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(folder, name)
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(400, "Imagen mayor a 8 MB")
    with open(dest, "wb") as fh:
        fh.write(data)
    att = FormAttachment(
        form_id=form_id,
        filename=file.filename or name,
        rel_path=os.path.join(str(form_id), name),
        mime=file.content_type or "image/jpeg",
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return {"id": att.id, "filename": att.filename}


@router.get("/attachments/{att_id}/file")
def get_attachment_file(att_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    att = db.query(FormAttachment).filter(FormAttachment.id == att_id).first()
    if not att:
        raise HTTPException(404, "No encontrado")
    path = os.path.join(get_settings().EVIDENCE_ROOT, att.rel_path)
    if not os.path.isfile(path):
        raise HTTPException(404, "Archivo ausente en disco")
    return FileResponse(path, media_type=att.mime or "image/jpeg", filename=att.filename)


@router.delete("/attachments/{att_id}")
def delete_attachment(att_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    att = db.query(FormAttachment).filter(FormAttachment.id == att_id).first()
    if not att:
        raise HTTPException(404, "No encontrado")
    path = os.path.join(get_settings().EVIDENCE_ROOT, att.rel_path)
    try:
        if os.path.isfile(path):
            os.remove(path)
    except Exception:
        pass
    db.delete(att)
    db.commit()
    return {"ok": True}