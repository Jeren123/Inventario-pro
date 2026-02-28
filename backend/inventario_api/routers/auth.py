from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Usuario
from ..core.security import hash_password, verificar_password, crear_token
from ..core.dependencies import solo_admin
from .. import schemas

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(
    user: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(solo_admin)   # ← solo admins autenticados
):
    usuario_existente = db.query(Usuario).filter(
        Usuario.email == user.email
    ).first()

    if usuario_existente:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    nuevo_usuario = Usuario(
        nombre=user.nombre,
        email=user.email,
        password=hash_password(user.password),
        id_rol=user.id_rol
    )

    db.add(nuevo_usuario)
    db.commit()

    return {"mensaje": "Usuario creado correctamente"}


@router.get("/usuarios")
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(solo_admin)
):
    usuarios = db.query(Usuario).all()
    return [
        {
            "id_usuario": u.id_usuario,
            "nombre": u.nombre,
            "email": u.email,
            "id_rol": u.id_rol,
            "rol": "Administrador" if u.id_rol == 1 else "Vendedor"
        }
        for u in usuarios
    ]


@router.delete("/usuarios/{id_usuario}")
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(solo_admin)
):
    if id_usuario == current_user.id_usuario:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")

    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado correctamente"}


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.UsuarioLogin, db: Session = Depends(get_db)):

    usuario = db.query(Usuario).filter(
        Usuario.email == data.email
    ).first()

    if not usuario or not verificar_password(data.password, usuario.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = crear_token({
        "sub": usuario.email,
        "id_usuario": usuario.id_usuario,
        "id_rol": usuario.id_rol
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }