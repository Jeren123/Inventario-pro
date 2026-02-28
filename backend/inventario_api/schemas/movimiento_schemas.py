from pydantic import BaseModel
from enum import Enum


class TipoMovimiento(str, Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"


class MovimientoCreate(BaseModel):
    id_producto: int
    cantidad: int
    motivo: str


class MovimientoResponse(BaseModel):
    id_movimiento: int
    id_producto: int
    tipo: TipoMovimiento
    cantidad: int
    motivo: str

    class Config:
        from_attributes = True