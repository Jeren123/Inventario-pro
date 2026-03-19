from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import VentaCreate, VentaResponse
from ..services.venta_service import registrar_venta
from ..core.dependencies import get_db, admin_o_vendedor
from ..models import Usuario

router = APIRouter(prefix="/ventas", tags=["Ventas"])

@router.post("/", response_model=VentaResponse)
def crear_venta(venta: VentaCreate, db: Session = Depends(get_db), user: Usuario = Depends(admin_o_vendedor)):
    try:
        return registrar_venta(db, venta)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
