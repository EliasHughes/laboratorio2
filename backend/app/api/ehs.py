from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.models.incident import Incident
from app.models.ehs import EhsMonthly, EhsRecord, EhsAttachment

import os
import uuid
from fastapi import File, UploadFile
from fastapi.responses import FileResponse
from app.core.config import get_settings


router = APIRouter(prefix="/ehs", tags=["EHS"])


def _idx(acc, lost, hht, const):
    h = float(hht or 0)
    c = float(const or 200000)
    if h <= 0:
        return {"ifreq": 0, "igrav": 0, "iacc": 0, "iresp": 0}
    iff = acc * c / h
    ig = lost * c / h
    return {
        "ifreq": round(iff, 2),
        "igrav": round(ig, 2),
        "iacc": round(iff * ig / 1000, 2),
        "iresp": round(ig * 16, 2),
    }


class IncidentIn(BaseModel):
    title: str
    area: Optional[str] = None
    severity: str = "media"
    description: Optional[str] = None
    lot_number: Optional[str] = None
    status: str = "abierto"


class MonthIn(BaseModel):
    year: int
    month: int
    nave: Optional[str] = None
    area: str
    accidents: int = 0
    lost_days: int = 0
    avg_workers: float = 0
    hht: Optional[float] = None
    constant: float = 200000


class RecordIn(BaseModel):
    kind: str
    title: str
    area: Optional[str] = None
    status: str = "abierto"
    payload: Optional[str] = None


@router.get("/incidents")
def list_incidents(db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "view"))):
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


@router.post("/incidents")
def create_incident(body: IncidentIn, db: Session = Depends(get_db), user: User = Depends(require_permission("ehs", "create"))):
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
    return {"id": row.id}


@router.put("/incidents/{iid}")
def update_incident(iid: int, body: IncidentIn, db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "edit"))):
    row = db.query(Incident).filter(Incident.id == iid).first()
    if not row:
        raise HTTPException(404, "No encontrado")
    row.title = body.title.strip()
    row.area = body.area
    row.severity = body.severity
    row.status = body.status
    row.description = body.description
    row.lot_number = body.lot_number
    row.updated_at = datetime.utcnow()
    db.commit()
    return {"id": row.id, "status": row.status}


@router.get("/monthly")
def list_monthly(db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "view"))):
    rows = db.query(EhsMonthly).order_by(EhsMonthly.year.desc(), EhsMonthly.month.desc()).all()
    out = []
    for r in rows:
        hht = r.hht if r.hht else (r.avg_workers or 0) * 8 * 22
        idx = _idx(r.accidents or 0, r.lost_days or 0, hht, r.constant)
        out.append({
            "id": r.id,
            "year": r.year,
            "month": r.month,
            "nave": r.nave,
            "area": r.area,
            "accidents": r.accidents,
            "lost_days": r.lost_days,
            "avg_workers": r.avg_workers,
            "hht": round(hht, 2),
            "constant": r.constant,
            **idx,
        })
    return out


@router.post("/monthly")
def create_monthly(body: MonthIn, db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "create"))):
    hht = body.hht if body.hht else body.avg_workers * 8 * 22
    row = EhsMonthly(
        year=body.year,
        month=body.month,
        nave=body.nave,
        area=body.area,
        accidents=body.accidents,
        lost_days=body.lost_days,
        avg_workers=body.avg_workers,
        hht=hht,
        constant=body.constant,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id}


@router.get("/records")
def list_records(kind: Optional[str] = None, db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "view"))):
    q = db.query(EhsRecord)
    if kind:
        q = q.filter(EhsRecord.kind == kind)
    rows = q.order_by(EhsRecord.id.desc()).limit(200).all()
    return [
        {
            "id": r.id,
            "kind": r.kind,
            "title": r.title,
            "area": r.area,
            "status": r.status,
            "payload": r.payload,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.post("/records")
def create_record(body: RecordIn, db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "create"))):
    row = EhsRecord(kind=body.kind, title=body.title.strip(), area=body.area, status=body.status, payload=body.payload)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id}


@router.put("/records/{rid}")
def close_record(rid: int, db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "edit"))):
    row = db.query(EhsRecord).filter(EhsRecord.id == rid).first()
    if not row:
        raise HTTPException(404, "No encontrado")
    row.status = "cerrado"
    db.commit()
    return {"id": row.id, "status": row.status}


@router.get("/summary")
def summary(db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "view"))):
    inc = db.query(Incident).all()
    open_i = len([x for x in inc if (x.status or "") != "cerrado"])
    months = db.query(EhsMonthly).all()
    acc = sum(m.accidents or 0 for m in months)
    return {"incidents": len(inc), "open": open_i, "accidents_year": acc}

ALLOWED_IMG = {".jpg", ".jpeg", ".png", ".webp"}


def _ehs_root() -> str:
    raw = getattr(get_settings(), "EVIDENCE_ROOT", None) or r"C:\YazooData\evidencias"
    path = os.path.join(raw, "ehs")
    os.makedirs(path, exist_ok=True)
    return path


@router.get("/{kind}/{ref_id}/attachments")
def list_ehs_att(kind: str, ref_id: int, db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "view"))):
    if kind not in {"incidents", "permisos", "capacitacion", "ncr"}:
        raise HTTPException(400, "Tipo no válido")
    rows = db.query(EhsAttachment).filter(EhsAttachment.kind == kind, EhsAttachment.ref_id == ref_id).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "mime": r.mime,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.post("/{kind}/{ref_id}/attachments")
async def upload_ehs_att(
    kind: str,
    ref_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("ehs", "create")),
):
    if kind not in {"incidents", "permisos", "capacitacion", "ncr"}:
        raise HTTPException(400, "Tipo no válido")
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    if ext not in ALLOWED_IMG:
        raise HTTPException(400, "Solo jpg, png o webp")
    folder = os.path.join(_ehs_root(), kind, str(ref_id))
    os.makedirs(folder, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(folder, name)
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(400, "Imagen mayor a 8 MB")
    with open(dest, "wb") as fh:
        fh.write(data)
    att = EhsAttachment(
        kind=kind,
        ref_id=ref_id,
        filename=file.filename or name,
        rel_path=os.path.join("ehs", kind, str(ref_id), name),
        mime=file.content_type or "image/jpeg",
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return {"id": att.id, "filename": att.filename}


@router.get("/attachments/{att_id}/file")
def get_ehs_file(att_id: int, db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "view"))):
    att = db.query(EhsAttachment).filter(EhsAttachment.id == att_id).first()
    if not att:
        raise HTTPException(404, "No encontrado")
    path = os.path.join(_ehs_root().rsplit("ehs", 1)[0].rstrip("\\/"), att.rel_path)
    if not os.path.isfile(path):
        path = os.path.join(getattr(get_settings(), "EVIDENCE_ROOT", r"C:\YazooData\evidencias"), att.rel_path)
    if not os.path.isfile(path):
        raise HTTPException(404, "Archivo ausente en disco")
    return FileResponse(path, media_type=att.mime or "image/jpeg", filename=att.filename)


@router.delete("/attachments/{att_id}")
def del_ehs_file(att_id: int, db: Session = Depends(get_db), _: User = Depends(require_permission("ehs", "create"))):
    att = db.query(EhsAttachment).filter(EhsAttachment.id == att_id).first()
    if not att:
        raise HTTPException(404, "No encontrado")
    root = getattr(get_settings(), "EVIDENCE_ROOT", None) or r"C:\YazooData\evidencias"
    path = os.path.join(root, att.rel_path)
    try:
        if os.path.isfile(path):
            os.remove(path)
    except Exception:
        pass
    db.delete(att)
    db.commit()
    return {"ok": True}