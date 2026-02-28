import httpx
from datetime import datetime

TELEGRAM_TOKEN = "8782125370:AAHmevCaAtYzWsrW0WcL7nWhwo826tuWyuU"
TELEGRAM_CHAT_ID = "7833928148"
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"


async def enviar_mensaje(texto: str) -> bool:
    """Envía un mensaje de texto al chat de Telegram configurado."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{TELEGRAM_API}/sendMessage",
                json={
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": texto,
                    "parse_mode": "HTML",
                },
            )
            return resp.status_code == 200
    except Exception:
        return False


async def alerta_stock_bajo(nombre: str, stock_actual: int, stock_minimo: int):
    mensaje = (
        f"⚠️ <b>ALERTA DE STOCK BAJO</b>\n\n"
        f"📦 Producto: <b>{nombre}</b>\n"
        f"📉 Stock actual: <b>{stock_actual}</b> unidades\n"
        f"🔻 Stock mínimo: <b>{stock_minimo}</b> unidades\n\n"
        f"👉 Considera reabastecer este producto pronto."
    )
    return await enviar_mensaje(mensaje)


async def notificar_venta(id_venta: int, total: float, cantidad_productos: int):
    ahora = datetime.now().strftime("%d/%m/%Y %H:%M")
    mensaje = (
        f"🛒 <b>NUEVA VENTA REGISTRADA</b>\n\n"
        f"🧾 Venta #<b>{id_venta}</b>\n"
        f"🕐 Fecha: {ahora}\n"
        f"📦 Productos: <b>{cantidad_productos}</b> ítems\n"
        f"💰 Total: <b>${total:.2f}</b>"
    )
    return await enviar_mensaje(mensaje)


async def resumen_diario(
    ventas_hoy: int,
    ingresos_hoy: float,
    productos_stock_bajo: int,
    valor_inventario: float,
):
    ahora = datetime.now().strftime("%d/%m/%Y")
    estado_stock = (
        f"🔴 <b>{productos_stock_bajo}</b> productos con stock bajo — ¡revisar!"
        if productos_stock_bajo > 0
        else "✅ Todo el stock en orden"
    )
    mensaje = (
        f"📊 <b>RESUMEN DEL DÍA — {ahora}</b>\n\n"
        f"🛒 Ventas realizadas: <b>{ventas_hoy}</b>\n"
        f"💰 Ingresos del día: <b>${ingresos_hoy:.2f}</b>\n"
        f"🏪 Valor inventario: <b>${valor_inventario:,.2f}</b>\n\n"
        f"📦 Stock: {estado_stock}\n\n"
        f"<i>Reporte automático de InventarioPro</i>"
    )
    return await enviar_mensaje(mensaje)
