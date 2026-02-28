from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import VentaCreate, VentaResponse
from ..services.venta_service import registrar_venta

router = APIRouter(prefix="/ventas", tags=["Ventas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=VentaResponse)
def crear_venta(venta: VentaCreate, db: Session = Depends(get_db)):
    try:
        return registrar_venta(db, venta)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))