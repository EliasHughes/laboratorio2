from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.api.deps import get_current_user, require_permission, create_audit_log, get_client_ip
from app.models.user import User
from app.models.solution import Solution, SolutionComponent
from app.schemas.solution import SolutionCreate, SolutionOut, ComponentOut

router = APIRouter(prefix="/solutions", tags=["Solutions"])


def to_out(s: Solution) -> SolutionOut:
    return SolutionOut(
        id=s.id,
        code=s.code,
        name=s.name,
        formula=s.formula,
        target_volume=s.target_volume,
        unit=s.unit or "mL",
        prepared_date=s.prepared_date,
        expiry_date=s.expiry_date,
        status=s.status or "preparada",
        notes=s.notes,
        prepared_by_id=s.prepared_by_id,
        prepared_by_name=s.prepared_by.full_name if s.prepared_by else None,
        components=[
            ComponentOut(
                id=c.id,
                component_name=c.component_name,
                qty_used=c.qty_used,
                unit=c.unit or "mL",
                product_id=c.product_id,
                lot_id=c.lot_id,
            )
            for c in (s.components or [])
        ],
        created_at=s.created_at,
    )


@router.get("", response_model=List[SolutionOut])
def list_solutions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("solutions", "view")),
):
    rows = (
        db.query(Solution)
        .options(joinedload(Solution.components), joinedload(Solution.prepared_by))
        .order_by(Solution.created_at.desc())
        .all()
    )
    return [to_out(s) for s in rows]


@router.post("", response_model=SolutionOut, status_code=status.HTTP_201_CREATED)
def create_solution(
    data: SolutionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("solutions", "create")),
):
    exists = db.query(Solution).filter(Solution.code == data.code).first()
    if exists:
        raise HTTPException(status_code=400, detail="Ya existe una solución con ese código")

    sol = Solution(
        code=data.code.strip(),
        name=data.name.strip(),
        formula=data.formula,
        target_volume=data.target_volume,
        unit=data.unit,
        prepared_date=data.prepared_date or date.today(),
        expiry_date=data.expiry_date,
        notes=data.notes,
        prepared_by_id=current_user.id,
        status="preparada",
    )
    db.add(sol)
    db.flush()

    for comp in data.components:
        db.add(
            SolutionComponent(
                solution_id=sol.id,
                product_id=comp.product_id,
                lot_id=comp.lot_id,
                component_name=comp.component_name,
                qty_used=comp.qty_used,
                unit=comp.unit,
            )
        )

    db.commit()
    db.refresh(sol)

    sol = (
        db.query(Solution)
        .options(joinedload(Solution.components), joinedload(Solution.prepared_by))
        .filter(Solution.id == sol.id)
        .first()
    )

    try:
        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity="Solution",
            entity_id=sol.id,
            details=f"Solución preparada: {sol.code} — {sol.name}",
            ip_address=get_client_ip(request),
        )
    except Exception:
        pass

    return to_out(sol)


@router.delete("/{solution_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_solution(
    solution_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("solutions", "delete")),
):
    sol = db.query(Solution).filter(Solution.id == solution_id).first()
    if not sol:
        raise HTTPException(status_code=404, detail="Solución no encontrada")
    db.delete(sol)
    db.commit()
    try:
        create_audit_log(
            db=db,
            user=current_user,
            action="DELETE",
            entity="Solution",
            entity_id=solution_id,
            details=f"Solución eliminada: {sol.code}",
            ip_address=get_client_ip(request),
        )
    except Exception:
        pass