from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from .database import engine
from .models import Base
from .routers import productos, ventas, movimientos, auth, ia, reportes, proveedores, historial_ventas, telegram
from .services.telegram_bot import polling_loop
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Arranque: iniciar bot de Telegram en background ──
    bot_task = asyncio.create_task(polling_loop())
    yield
    # ── Cierre: detener bot limpiamente ──
    bot_task.cancel()
    try:
        await bot_task
    except asyncio.CancelledError:
        pass


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
