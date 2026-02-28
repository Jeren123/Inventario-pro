from sqlalchemy import Column, Integer, String, DECIMAL, Boolean
from ..database import Base

class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    precio_compra = Column(DECIMAL(10,2), nullable=False)
    precio_venta = Column(DECIMAL(10,2), nullable=False)
    stock_actual = Column(Integer, default=0)
    stock_minimo = Column(Integer, default=5)
    activo = Column(Boolean, default=True)