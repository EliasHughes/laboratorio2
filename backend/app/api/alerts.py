from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lot import Lot

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("")
def list_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Alertas de inventario:
    - vencido
    - por_vencer (≤ 30 días)
    - stock_bajo (si el modelo tiene quantity / min_stock)
    """
    today = date.today()
    limit_soon = today + timedelta(days=30)
    alerts = []

    try:
        lots = db.query(Lot).all()
    except Exception:
        lots = []

    for lot in lots:
        # Campos reales según tu modelo (expiry_date)
        exp = getattr(lot, "expiry_date", None) or getattr(lot, "expiration_date", None)
        lot_code = getattr(lot, "lot_code", None) or getattr(lot, "code", None) or f"LOT-{lot.id}"
        product_name = ""
        if getattr(lot, "product", None) is not None:
            product_name = getattr(lot.product, "name", "") or ""
        label = f"{product_name} · {lot_code}".strip(" ·")

        qty = getattr(lot, "quantity", None)
        if qty is None:
            qty = getattr(lot, "current_qty", None)

        status = (getattr(lot, "status", None) or "").lower()

        if exp and isinstance(exp, date):
            if exp < today or status == "vencido":
                alerts.append(
                    {
                        "id": f"vencido-{lot.id}",
                        "type": "vencido",
                        "severity": "high",
                        "title": "Lote vencido",
                        "message": f"{label} venció el {exp.isoformat()}",
                        "link": "/inventory",
                    }
                )
            elif exp <= limit_soon or status in ("por_vencer", "por vencer"):
                days = (exp - today).days
                alerts.append(
                    {
                        "id": f"por_vencer-{lot.id}",
                        "type": "por_vencer",
                        "severity": "medium" if days > 7 else "high",
                        "title": "Lote por vencer",
                        "message": f"{label} vence en {days} día(s) ({exp.isoformat()})",
                        "link": "/inventory",
                    }
                )

        if status == "cuarentena":
            alerts.append(
                {
                    "id": f"cuarentena-{lot.id}",
                    "type": "cuarentena",
                    "severity": "medium",
                    "title": "Lote en cuarentena",
                    "message": f"{label} está en cuarentena",
                    "link": "/inventory",
                }
            )

        min_stock = getattr(lot, "min_stock", None)
        if qty is not None and min_stock is not None:
            try:
                if float(qty) <= float(min_stock):
                    alerts.append(
                        {
                            "id": f"stock-{lot.id}",
                            "type": "stock_bajo",
                            "severity": "medium",
                            "title": "Stock bajo",
                            "message": f"{label}: cantidad {qty} (mín. {min_stock})",
                            "link": "/inventory",
                        }
                    )
            except (TypeError, ValueError):
                pass

    # Prioridad: high primero
    order = {"high": 0, "medium": 1, "low": 2}
    alerts.sort(key=lambda a: order.get(a["severity"], 9))

    return {"alerts": alerts, "count": len(alerts)}