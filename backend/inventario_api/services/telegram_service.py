import os
import httpx
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN   = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
TELEGRAM_API     = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"


async def enviar_mensaje(texto: str) -> bool:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram no configurado (TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID vacios)")
        return False
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{TELEGRAM_API}/sendMessage",
                json={"chat_id": TELEGRAM_CHAT_ID, "text": texto, "parse_mode": "HTML"},
            )
            if resp.status_code != 200:
                print(f"Telegram error {resp.status_code}: {resp.text}")
                return False
            return True
    except Exception as e:
        print(f"Telegram excepcion: {e}")
        return False


async def alerta_stock_bajo(nombre: str, stock_actual: int, stock_minimo: int):
    mensaje = (
        f"<b>ALERTA DE STOCK BAJO</b>\n\n"
        f"Producto: <b>{nombre}</b>\n"
        f"Stock actual: <b>{stock_actual}</b> unidades\n"
        f"Stock minimo: <b>{stock_minimo}</b> unidades\n\n"
        f"Considera reabastecer este producto pronto."
    )
    return await enviar_mensaje(mensaje)


async def notificar_venta(id_venta: int, total: float, cantidad_productos: int):
    ahora = datetime.now().strftime("%d/%m/%Y %H:%M")
    mensaje = (
        f"<b>NUEVA VENTA REGISTRADA</b>\n\n"
        f"Venta #<b>{id_venta}</b>\n"
        f"Fecha: {ahora}\n"
        f"Productos: <b>{cantidad_productos}</b> items\n"
        f"Total: <b>${total:.2f}</b>"
    )
    return await enviar_mensaje(mensaje)


async def resumen_diario(ventas_hoy: int, ingresos_hoy: float, productos_stock_bajo: int, valor_inventario: float):
    ahora = datetime.now().strftime("%d/%m/%Y")
    estado_stock = (
        f"<b>{productos_stock_bajo}</b> productos con stock bajo - revisar!"
        if productos_stock_bajo > 0
        else "Todo el stock en orden"
    )
    mensaje = (
        f"<b>RESUMEN DEL DIA - {ahora}</b>\n\n"
        f"Ventas realizadas: <b>{ventas_hoy}</b>\n"
        f"Ingresos del dia: <b>${ingresos_hoy:.2f}</b>\n"
        f"Valor inventario: <b>${valor_inventario:,.2f}</b>\n\n"
        f"Stock: {estado_stock}\n\n"
        f"<i>Reporte automatico de InventarioPro</i>"
    )
    return await enviar_mensaje(mensaje)
