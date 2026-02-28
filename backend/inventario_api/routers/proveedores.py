from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Proveedor
from ..schemas import ProveedorCreate, ProveedorUpdate, ProveedorResponse
from ..core.dependencies import solo_admin, admin_o_vendedor
from ..models.usuario import Usuario

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[ProveedorResponse])
def listar_proveedores(db: Session = Depends(get_db), user: Usuario = Depends(admin_o_vendedor)):
    return db.query(Proveedor).all()

@router.post("/", response_model=ProveedorResponse)
def crear_proveedor(data: ProveedorCreate, db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    p = Proveedor(**data.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.put("/{id_proveedor}", response_model=ProveedorResponse)
def actualizar_proveedor(id_proveedor: int, data: ProveedorUpdate, db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    p = db.query(Proveedor).filter(Proveedor.id_proveedor == id_proveedor).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p

@router.delete("/{id_proveedor}")
def eliminar_proveedor(id_proveedor: int, db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    p = db.query(Proveedor).filter(Proveedor.id_proveedor == id_proveedor).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    db.delete(p)
    db.commit()
    return {"ok": True}
