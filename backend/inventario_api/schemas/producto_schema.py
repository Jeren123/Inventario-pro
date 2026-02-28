from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_compra: Decimal
    precio_venta: Decimal
    stock_actual: int
    stock_minimo: int
    activo: bool

class ProductoCreate(ProductoBase):
    pass

class ProductoResponse(ProductoBase):
    id_producto: int

    class Config:
        from_attributes = True