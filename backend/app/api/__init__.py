from fastapi import APIRouter
from app.api import alerts, solutions, auth, users, roles
from app.api import products, lots, movements, audit, forms, ehs
from app.api import wms, purchases, receiving, withdrawals
from app.api import approvals

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(roles.router)
api_router.include_router(products.router)
api_router.include_router(lots.router)
api_router.include_router(movements.router)
api_router.include_router(audit.router)
api_router.include_router(alerts.router)
api_router.include_router(solutions.router)
api_router.include_router(forms.router)
api_router.include_router(ehs.router)
api_router.include_router(wms.router)
api_router.include_router(purchases.router)
api_router.include_router(receiving.router)
api_router.include_router(withdrawals.router)
api_router.include_router(approvals.router)