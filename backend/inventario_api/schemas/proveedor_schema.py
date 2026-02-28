from pydantic import BaseModel
from typing import Optional

class ProveedorBase(BaseModel):
    nombre:    str
    contacto:  Optional[str] = None
    telefono:  Optional[str] = None
    email:     Optional[str] = None
    direccion: Optional[str] = None
    activo:    bool = True

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    nombre:    Optional[str] = None
    contacto:  Optional[str] = None
    telefono:  Optional[str] = None
    email:     Optional[str] = None
    direccion: Optional[str] = None
    activo:    Optional[bool] = None

class ProveedorResponse(ProveedorBase):
    id_proveedor: int
    class Config:
        from_attributes = True
