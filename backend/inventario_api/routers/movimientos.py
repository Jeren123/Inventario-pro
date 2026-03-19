from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models import Producto, MovimientoInventario, Usuario
from ..models.movimiento import TipoMovimiento
from ..core.dependencies import get_db, solo_admin, admin_o_vendedor
from .. import schemas

router = APIRouter(prefix="/movimientos", tags=["Movimientos"])


@router.post("/entrada", response_model=schemas.MovimientoResponse)
def registrar_entrada(
    data: schemas.MovimientoCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    producto = db.query(Producto).filter(Producto.id_producto == data.id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    producto.stock_actual += data.cantidad
    movimiento = MovimientoInventario(
        id_producto=data.id_producto,
        tipo=TipoMovimiento.ENTRADA,
        id_usuario=user.id_usuario,
        cantidad=data.cantidad,
        motivo=data.motivo
    )
    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)
    return movimiento


@router.post("/salida", response_model=schemas.MovimientoResponse)
def registrar_salida(
    data: schemas.MovimientoCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(admin_o_vendedor)
):
    producto = db.query(Producto).filter(Producto.id_producto == data.id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto.stock_actual < data.cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    producto.stock_actual -= data.cantidad
    movimiento = MovimientoInventario(
        id_producto=data.id_producto,
        id_usuario=user.id_usuario,
        tipo=TipoMovimiento.SALIDA,
        cantidad=data.cantidad,
        motivo=data.motivo
    )
    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)
    return movimiento


@router.get("/", response_model=list[schemas.MovimientoResponse])
def listar_movimientos(
    id_producto: Optional[int] = None,
    tipo: Optional[TipoMovimiento] = None,
    fecha_inicio: Optional[datetime] = None,
    fecha_fin: Optional[datetime] = None,
    db: Session = Depends(get_db),
    user: Usuario = Depends(solo_admin)
):
    query = db.query(MovimientoInventario)
    if id_producto:
        query = query.filter(MovimientoInventario.id_producto == id_producto)
    if tipo:
        query = query.filter(MovimientoInventario.tipo == tipo)
    if fecha_inicio:
        query = query.filter(MovimientoInventario.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(MovimientoInventario.fecha <= fecha_fin)
    return query.order_by(MovimientoInventario.fecha.desc()).all()
