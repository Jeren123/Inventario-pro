from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Producto, Usuario
from ..schemas import ProductoCreate, ProductoResponse
from ..core.dependencies import solo_admin, admin_o_vendedor  

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 👀 ADMIN y VENDEDOR pueden ver productos
@router.get("/", response_model=list[ProductoResponse])
def listar_productos(
    db: Session = Depends(get_db),
    user: Usuario = Depends(admin_o_vendedor)
):
    productos = db.query(Producto).all()
    return productos


@router.post("/", response_model=ProductoResponse)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    nuevo_producto = Producto(
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio_compra=producto.precio_compra,
        precio_venta=producto.precio_venta,
        stock_actual=producto.stock_actual,
        stock_minimo=producto.stock_minimo,
        activo=producto.activo
    )

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return nuevo_producto

@router.put("/{id_producto}", response_model=ProductoResponse)
def actualizar_producto(
    id_producto: int,
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for k, v in producto.dict().items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{id_producto}")
def eliminar_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(p)
    db.commit()
    return {"ok": True}
