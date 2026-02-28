from pydantic import BaseModel, EmailStr


class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    id_rol: int


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str