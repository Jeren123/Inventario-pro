from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..models import Producto, Venta
from ..core.dependencies import get_db, solo_admin
from ..models.usuario import Usuario
from ..services.telegram_service import enviar_mensaje, alerta_stock_bajo, resumen_diario

router = APIRouter(prefix="/telegram", tags=["Telegram"])


@router.post("/test")
async def test_conexion(db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    ok = await enviar_mensaje(
        "✅ <b>InventarioPro conectado correctamente</b>\n\n"
        "🤖 Tu bot de Telegram está listo para enviarte:\n"
        "• Alertas de stock bajo\n"
        "• Notificaciones de ventas\n"
        "• Resúmenes diarios automáticos"
    )
    return {"ok": ok, "mensaje": "Mensaje de prueba enviado" if ok else "Error al enviar"}


@router.post("/alertas-stock")
async def verificar_stock_bajo(db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    productos_bajo = db.query(Producto).filter(
        Producto.stock_actual <= Producto.stock_minimo, Producto.activo == True
    ).all()

    if not productos_bajo:
        ok = await enviar_mensaje("✅ <b>Todo el stock está en orden</b>\n\nNo hay productos con stock bajo.")
        return {"ok": ok, "productos_alertados": 0}

    enviados = sum(1 for p in productos_bajo if await alerta_stock_bajo(p.nombre, p.stock_actual, p.stock_minimo))
    return {"ok": True, "productos_alertados": enviados, "productos": [p.nombre for p in productos_bajo]}


@router.post("/resumen-hoy")
async def enviar_resumen_hoy(db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    hoy = date.today()
    ventas_hoy = db.query(Venta).filter(func.date(Venta.fecha) == hoy).all()
    total_ventas = len(ventas_hoy)
    ingresos_hoy = sum(float(v.total) for v in ventas_hoy)
    stock_bajo = db.query(Producto).filter(Producto.stock_actual <= Producto.stock_minimo, Producto.activo == True).count()
    productos = db.query(Producto).filter(Producto.activo == True).all()
    valor_inventario = sum(float(p.precio_venta) * p.stock_actual for p in productos)

    ok = await resumen_diario(total_ventas, ingresos_hoy, stock_bajo, valor_inventario)
    return {"ok": ok, "ventas_hoy": total_ventas, "ingresos_hoy": ingresos_hoy, "stock_bajo": stock_bajo}


@router.post("/mensaje")
async def enviar_mensaje_personalizado(payload: dict, user: Usuario = Depends(solo_admin)):
    texto = payload.get("texto", "").strip()
    if not texto:
        return {"ok": False, "error": "El texto no puede estar vacío"}
    ok = await enviar_mensaje(f"📢 <b>Mensaje del sistema:</b>\n\n{texto}")
    return {"ok": ok}
