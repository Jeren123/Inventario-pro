from pydantic import BaseModel
from typing import List
from decimal import Decimal

class DetalleVentaCreate(BaseModel):
    id_producto: int
    cantidad: int

class VentaCreate(BaseModel):
    id_usuario: int
    detalles: List[DetalleVentaCreate]

class VentaResponse(BaseModel):
    id_venta: int
    total: Decimal

    class Config:
        from_attributes = True