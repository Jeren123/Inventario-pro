from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime
from ..database import SessionLocal
from ..models import Venta, DetalleVenta, Producto, Usuario
from ..core.dependencies import solo_admin

router = APIRouter(prefix="/historial-ventas", tags=["Historial Ventas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def listar_ventas(
    fecha_inicio: Optional[str] = Query(None),
    fecha_fin:    Optional[str] = Query(None),
    limit:        int = Query(50, le=200),
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    query = db.query(Venta)

    if fecha_inicio:
        query = query.filter(Venta.fecha >= datetime.fromisoformat(fecha_inicio))
    if fecha_fin:
        query = query.filter(Venta.fecha <= datetime.fromisoformat(fecha_fin + "T23:59:59"))

    ventas = query.order_by(desc(Venta.fecha)).limit(limit).all()

    resultado = []
    for v in ventas:
        detalles = db.query(DetalleVenta).filter(DetalleVenta.id_venta == v.id_venta).all()
        items = []
        for d in detalles:
            prod = db.query(Producto).filter(Producto.id_producto == d.id_producto).first()
            items.append({
                "nombre": prod.nombre if prod else f"Prod #{d.id_producto}",
                "cantidad": d.cantidad,
                "precio_unitario": float(d.precio_unitario),
                "subtotal": float(d.subtotal),
            })
        resultado.append({
            "id_venta": v.id_venta,
            "fecha": v.fecha.isoformat() if v.fecha else None,
            "total": float(v.total),
            "items": items,
            "id_usuario": v.id_usuario,
        })

    total_periodo = sum(r["total"] for r in resultado)
    return {
        "ventas": resultado,
        "total_registros": len(resultado),
        "total_periodo": round(total_periodo, 2),
    }
