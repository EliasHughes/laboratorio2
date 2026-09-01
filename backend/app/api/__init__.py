from fastapi import APIRouter
from app.api import alerts
from app.api import solutions
from app.api import auth, users, roles, products, lots, movements, audit
from app.api import forms
from app.api import ehs

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