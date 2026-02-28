from sqlalchemy import Column, Integer, DateTime, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from ..database import Base

class Venta(Base):
    __tablename__ = "ventas"

    id_venta = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    total = Column(DECIMAL(10,2), nullable=False, default=0)