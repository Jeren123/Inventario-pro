from contextlib import asynccontextmanager
import asyncio
import os
from fastapi import FastAPI
from .database import engine
from .models import Base
from .routers import productos, ventas, movimientos, auth, ia, reportes, proveedores, historial_ventas, telegram
from .services.telegram_bot import polling_loop
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    bot_task = asyncio.create_task(polling_loop())
    yield
    bot_task.cancel()
    try:
        await bot_task
    except asyncio.CancelledError:
        pass


app = FastAPI(lifespan=lifespan)

# CORS — funciona en local y en producción
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://inventario-pro-frontend.vercel.app",
]

# Si hay una URL de frontend en variables de entorno, agregarla también
FRONTEND_URL = os.getenv("FRONTEND_URL")
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas
Base.metadata.create_all(bind=engine)

# Registrar routers
app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(ventas.router)
app.include_router(movimientos.router)
app.include_router(ia.router)
app.include_router(reportes.router)
app.include_router(proveedores.router)
app.include_router(historial_ventas.router)
app.include_router(telegram.router)