from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Usuario
from ..core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    if usuario is None:
        raise credentials_exception

    return usuario

from fastapi import HTTPException, Depends
from ..models import Usuario

def solo_admin(current_user: Usuario = Depends(get_current_user)):
    if current_user.id_rol != 1:  # 1 = ADMIN
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos de administrador"
        )
    return current_user


def admin_o_vendedor(current_user: Usuario = Depends(get_current_user)):
    if current_user.id_rol not in [1, 2]:  # 1 = ADMIN, 2 = VENDEDOR
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos suficientes"
        )
    return current_user