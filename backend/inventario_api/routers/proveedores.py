from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models import Proveedor
from ..models.usuario import Usuario
from ..schemas import ProveedorCreate, ProveedorUpdate, ProveedorResponse
from ..core.dependencies import get_db, solo_admin, admin_o_vendedor

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])


@router.get("/", response_model=list[ProveedorResponse])
def listar_proveedores(
    db: Session = Depends(get_db),
    user: Usuario = Depends(admin_o_vendedor)
):
    return db.query(Proveedor).all()


@router.post("/", response_model=ProveedorResponse)
def crear_proveedor(
    data: ProveedorCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    p = Proveedor(**data.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/{id_proveedor}", response_model=ProveedorResponse)
def actualizar_proveedor(
    id_proveedor: int,
    data: ProveedorUpdate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    p = db.query(Proveedor).filter(Proveedor.id_proveedor == id_proveedor).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{id_proveedor}")
def eliminar_proveedor(
    id_proveedor: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    p = db.query(Proveedor).filter(Proveedor.id_proveedor == id_proveedor).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    # Soft-delete: marcar como inactivo
    p.activo = False
    db.commit()
    return {"ok": True, "mensaje": "Proveedor desactivado correctamente"}
