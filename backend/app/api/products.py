from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_permission, create_audit_log, get_client_ip
from app.models.user import User
from app.models.product import Product
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductOut])
def list_products(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "view")),
):
    products = ProductRepository.get_all(db, skip=skip, limit=limit)
    result = []
    for p in products:
        data = ProductOut.model_validate(p)
        try:
            data.current_stock = ProductRepository.get_current_stock(db, p.id)
        except Exception:
            data.current_stock = 0
        result.append(data)
    return result


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "view")),
):
    product = ProductRepository.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    data = ProductOut.model_validate(product)
    try:
        data.current_stock = ProductRepository.get_current_stock(db, product.id)
    except Exception:
        data.current_stock = 0
    return data


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    obj_in: ProductCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "create")),
):
    if ProductRepository.get_by_code(db, obj_in.code):
        raise HTTPException(status_code=400, detail="El código de producto ya existe")

    product = ProductRepository.create(db, obj_in)

    create_audit_log(
        db=db,
        user=current_user,
        action="CREATE",
        entity="Product",
        entity_id=product.id,
        details=f"Producto creado: {product.code} - {product.name}",
        ip_address=get_client_ip(request),
    )
    data = ProductOut.model_validate(product)
    data.current_stock = 0
    return data


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    obj_in: ProductUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "edit")),
):
    product = ProductRepository.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    product = ProductRepository.update(db, product, obj_in)

    create_audit_log(
        db=db,
        user=current_user,
        action="UPDATE",
        entity="Product",
        entity_id=product.id,
        details=f"Producto actualizado: {product.code}",
        ip_address=get_client_ip(request),
    )
    data = ProductOut.model_validate(product)
    try:
        data.current_stock = ProductRepository.get_current_stock(db, product.id)
    except Exception:
        data.current_stock = 0
    return data


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("inventory", "delete")),
):
    product = ProductRepository.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    code = product.code
    ProductRepository.delete(db, product)

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE",
        entity="Product",
        entity_id=product_id,
        details=f"Producto eliminado/desactivado: {code}",
        ip_address=get_client_ip(request),
    )
    return None