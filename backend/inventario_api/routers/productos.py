from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models import Producto, Usuario
from ..schemas import ProductoCreate, ProductoResponse
from ..core.dependencies import get_db, solo_admin, admin_o_vendedor

router = APIRouter(prefix="/productos", tags=["Productos"])

@router.get("/", response_model=list[ProductoResponse])
def listar_productos(db: Session = Depends(get_db), user: Usuario = Depends(admin_o_vendedor)):
    return db.query(Producto).all()

@router.post("/", response_model=ProductoResponse)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    nuevo = Producto(
        nombre=producto.nombre, descripcion=producto.descripcion,
        precio_compra=producto.precio_compra, precio_venta=producto.precio_venta,
        stock_actual=producto.stock_actual, stock_minimo=producto.stock_minimo, activo=producto.activo
    )
    db.add(nuevo); db.commit(); db.refresh(nuevo)
    return nuevo

@router.put("/{id_producto}", response_model=ProductoResponse)
def actualizar_producto(id_producto: int, producto: ProductoCreate, db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for k, v in producto.model_dump().items():
        setattr(p, k, v)
    db.commit(); db.refresh(p)
    return p

@router.delete("/{id_producto}")
def eliminar_producto(id_producto: int, db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    p.activo = False; db.commit()
    return {"ok": True, "mensaje": "Producto desactivado correctamente"}
