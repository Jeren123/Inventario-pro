from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum


class TipoMovimiento(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"


class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id_movimiento = Column(Integer, primary_key=True, index=True)

    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False) 

    tipo = Column(Enum(TipoMovimiento), nullable=False)
    cantidad = Column(Integer, nullable=False)
    motivo = Column(String(100))

    fecha = Column(DateTime, server_default=func.now())

    producto = relationship("Producto")
    usuario = relationship("Usuario")  