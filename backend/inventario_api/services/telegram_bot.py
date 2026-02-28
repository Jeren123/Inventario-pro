"""
Bot de Telegram con polling — escucha mensajes y ejecuta comandos sobre el inventario.
Se inicia automáticamente junto con FastAPI usando lifespan.

Comandos disponibles:
  /start             — Bienvenida y lista de comandos
  /stock             — Ver todos los productos y su stock
  /ventas            — Resumen de ventas del día
  /entrada <id> <cantidad> <motivo>  — Registrar entrada de stock
  /salida  <id> <cantidad> <motivo>  — Registrar salida de stock
  /buscar <nombre>   — Buscar producto por nombre
  /ayuda             — Ver todos los comandos
"""

import asyncio
import httpx
from datetime import date
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Producto, Venta, MovimientoInventario
from ..models.movimiento import TipoMovimiento

TELEGRAM_TOKEN  = "8782125370:AAHmevCaAtYzWsrW0WcL7nWhwo826tuWyuU"
TELEGRAM_CHAT_ID = "7833928148"
API = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

_ultimo_update_id = 0


# ── HELPERS ───────────────────────────────────────────────────────────────────

async def _send(texto: str, chat_id: str = TELEGRAM_CHAT_ID):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(f"{API}/sendMessage", json={
                "chat_id": chat_id,
                "text": texto,
                "parse_mode": "HTML",
            })
    except Exception:
        pass


def _get_db() -> Session:
    return SessionLocal()


# ── COMANDOS ──────────────────────────────────────────────────────────────────

async def cmd_start(chat_id: str):
    await _send(
        "👋 <b>Bienvenido a InventarioPro Bot</b>\n\n"
        "Puedes controlar tu inventario directamente desde aquí.\n\n"
        "<b>Comandos disponibles:</b>\n"
        "📦 /stock — Ver stock de todos los productos\n"
        "🛒 /ventas — Resumen de ventas de hoy\n"
        "➕ /entrada &lt;id&gt; &lt;cantidad&gt; &lt;motivo&gt;\n"
        "➖ /salida &lt;id&gt; &lt;cantidad&gt; &lt;motivo&gt;\n"
        "🔍 /buscar &lt;nombre&gt; — Buscar producto\n"
        "❓ /ayuda — Ver esta lista\n\n"
        "<i>Ejemplo: /entrada 3 50 Compra a proveedor</i>",
        chat_id
    )


async def cmd_stock(chat_id: str):
    db = _get_db()
    try:
        productos = db.query(Producto).filter(Producto.activo == True).order_by(Producto.nombre).all()
        if not productos:
            await _send("📦 No hay productos registrados.", chat_id)
            return

        lineas = ["📦 <b>STOCK ACTUAL</b>\n"]
        for p in productos:
            icono = "🔴" if p.stock_actual <= p.stock_minimo else "🟢"
            lineas.append(
                f"{icono} <b>[{p.id_producto}]</b> {p.nombre}\n"
                f"   Stock: <b>{p.stock_actual}</b> | Mín: {p.stock_minimo} | ${float(p.precio_venta):.2f}"
            )

        bajo = [p for p in productos if p.stock_actual <= p.stock_minimo]
        if bajo:
            lineas.append(f"\n⚠️ <b>{len(bajo)} producto(s) con stock bajo</b>")

        await _send("\n".join(lineas), chat_id)
    finally:
        db.close()


async def cmd_ventas(chat_id: str):
    db = _get_db()
    try:
        hoy = date.today()
        ventas = db.query(Venta).filter(func.date(Venta.fecha) == hoy).all()
        total = sum(float(v.total) for v in ventas)

        productos = db.query(Producto).filter(Producto.activo == True).all()
        valor_inv = sum(float(p.precio_venta) * p.stock_actual for p in productos)

        msg = (
            f"🛒 <b>VENTAS DE HOY</b>\n\n"
            f"📊 Ventas realizadas: <b>{len(ventas)}</b>\n"
            f"💰 Ingresos totales: <b>${total:.2f}</b>\n"
            f"🏪 Valor inventario: <b>${valor_inv:,.2f}</b>"
        )
        await _send(msg, chat_id)
    finally:
        db.close()


async def cmd_entrada(chat_id: str, partes: list):
    """Uso: /entrada <id_producto> <cantidad> <motivo...>"""
    if len(partes) < 3:
        await _send(
            "❌ Formato incorrecto.\n\n"
            "✅ Uso correcto:\n"
            "<code>/entrada &lt;id&gt; &lt;cantidad&gt; &lt;motivo&gt;</code>\n\n"
            "Ejemplo: <code>/entrada 3 50 Compra a proveedor</code>",
            chat_id
        )
        return

    try:
        id_producto = int(partes[0])
        cantidad    = int(partes[1])
        motivo      = " ".join(partes[2:]) if len(partes) > 2 else "Entrada desde Telegram"
    except ValueError:
        await _send("❌ El ID y la cantidad deben ser números.\nEjemplo: <code>/entrada 3 50 Reposición</code>", chat_id)
        return

    db = _get_db()
    try:
        producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
        if not producto:
            await _send(f"❌ No existe ningún producto con ID <b>{id_producto}</b>.\n\nUsa /stock para ver los IDs.", chat_id)
            return

        stock_antes = producto.stock_actual
        producto.stock_actual += cantidad

        mov = MovimientoInventario(
            id_producto=id_producto,
            id_usuario=1,  # usuario sistema/admin
            tipo=TipoMovimiento.ENTRADA,
            cantidad=cantidad,
            motivo=f"[Telegram] {motivo}",
        )
        db.add(mov)
        db.commit()

        await _send(
            f"✅ <b>ENTRADA REGISTRADA</b>\n\n"
            f"📦 Producto: <b>{producto.nombre}</b>\n"
            f"➕ Cantidad agregada: <b>+{cantidad}</b>\n"
            f"📊 Stock anterior: {stock_antes}\n"
            f"📊 Stock actual: <b>{producto.stock_actual}</b>\n"
            f"📝 Motivo: {motivo}",
            chat_id
        )
    finally:
        db.close()


async def cmd_salida(chat_id: str, partes: list):
    """Uso: /salida <id_producto> <cantidad> <motivo...>"""
    if len(partes) < 3:
        await _send(
            "❌ Formato incorrecto.\n\n"
            "✅ Uso correcto:\n"
            "<code>/salida &lt;id&gt; &lt;cantidad&gt; &lt;motivo&gt;</code>\n\n"
            "Ejemplo: <code>/salida 3 10 Venta directa</code>",
            chat_id
        )
        return

    try:
        id_producto = int(partes[0])
        cantidad    = int(partes[1])
        motivo      = " ".join(partes[2:]) if len(partes) > 2 else "Salida desde Telegram"
    except ValueError:
        await _send("❌ El ID y la cantidad deben ser números.\nEjemplo: <code>/salida 3 10 Ajuste</code>", chat_id)
        return

    db = _get_db()
    try:
        producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
        if not producto:
            await _send(f"❌ No existe ningún producto con ID <b>{id_producto}</b>.\n\nUsa /stock para ver los IDs.", chat_id)
            return

        if producto.stock_actual < cantidad:
            await _send(
                f"❌ Stock insuficiente.\n\n"
                f"📦 {producto.nombre}\n"
                f"Stock disponible: <b>{producto.stock_actual}</b>\n"
                f"Cantidad solicitada: <b>{cantidad}</b>",
                chat_id
            )
            return

        stock_antes = producto.stock_actual
        producto.stock_actual -= cantidad

        mov = MovimientoInventario(
            id_producto=id_producto,
            id_usuario=1,
            tipo=TipoMovimiento.SALIDA,
            cantidad=cantidad,
            motivo=f"[Telegram] {motivo}",
        )
        db.add(mov)
        db.commit()

        alerta = ""
        if producto.stock_actual <= producto.stock_minimo:
            alerta = f"\n\n⚠️ <b>ALERTA:</b> Stock bajo el mínimo ({producto.stock_minimo})"

        await _send(
            f"✅ <b>SALIDA REGISTRADA</b>\n\n"
            f"📦 Producto: <b>{producto.nombre}</b>\n"
            f"➖ Cantidad retirada: <b>-{cantidad}</b>\n"
            f"📊 Stock anterior: {stock_antes}\n"
            f"📊 Stock actual: <b>{producto.stock_actual}</b>\n"
            f"📝 Motivo: {motivo}{alerta}",
            chat_id
        )
    finally:
        db.close()


async def cmd_buscar(chat_id: str, partes: list):
    if not partes:
        await _send("❌ Escribe un nombre para buscar.\nEjemplo: <code>/buscar camisa</code>", chat_id)
        return

    nombre = " ".join(partes)
    db = _get_db()
    try:
        productos = db.query(Producto).filter(
            Producto.nombre.ilike(f"%{nombre}%")
        ).all()

        if not productos:
            await _send(f"🔍 No se encontraron productos con '<b>{nombre}</b>'.", chat_id)
            return

        lineas = [f"🔍 <b>Resultados para '{nombre}':</b>\n"]
        for p in productos:
            icono = "🔴" if p.stock_actual <= p.stock_minimo else "🟢"
            lineas.append(
                f"{icono} <b>[ID: {p.id_producto}]</b> {p.nombre}\n"
                f"   Stock: <b>{p.stock_actual}</b> | P.Venta: ${float(p.precio_venta):.2f}"
            )

        await _send("\n".join(lineas), chat_id)
    finally:
        db.close()


async def cmd_ayuda(chat_id: str):
    await cmd_start(chat_id)


# ── PROCESADOR DE MENSAJES ────────────────────────────────────────────────────

async def procesar_mensaje(mensaje: dict):
    chat_id = str(mensaje["chat"]["id"])
    texto   = mensaje.get("text", "").strip()

    if not texto:
        return

    # Solo responder al chat autorizado
    if chat_id != TELEGRAM_CHAT_ID:
        await _send("⛔ No tienes permiso para usar este bot.", chat_id)
        return

    partes  = texto.split()
    comando = partes[0].lower().split("@")[0]  # elimina @botname si viene
    args    = partes[1:]

    if comando == "/start":
        await cmd_start(chat_id)
    elif comando == "/stock":
        await cmd_stock(chat_id)
    elif comando == "/ventas":
        await cmd_ventas(chat_id)
    elif comando == "/entrada":
        await cmd_entrada(chat_id, args)
    elif comando == "/salida":
        await cmd_salida(chat_id, args)
    elif comando == "/buscar":
        await cmd_buscar(chat_id, args)
    elif comando in ("/ayuda", "/help"):
        await cmd_ayuda(chat_id)
    else:
        await _send(
            f"❓ Comando no reconocido: <code>{comando}</code>\n\n"
            "Escribe /ayuda para ver los comandos disponibles.",
            chat_id
        )


# ── POLLING LOOP ──────────────────────────────────────────────────────────────

async def polling_loop():
    """Loop infinito que escucha mensajes de Telegram cada 2 segundos."""
    global _ultimo_update_id
    print("🤖 Telegram Bot iniciado — escuchando mensajes...")

    while True:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(f"{API}/getUpdates", params={
                    "offset": _ultimo_update_id + 1,
                    "timeout": 20,
                    "allowed_updates": ["message"],
                })

                if resp.status_code == 200:
                    data = resp.json()
                    for update in data.get("result", []):
                        _ultimo_update_id = update["update_id"]
                        if "message" in update:
                            await procesar_mensaje(update["message"])

        except asyncio.CancelledError:
            print("🛑 Telegram Bot detenido.")
            break
        except Exception:
            await asyncio.sleep(5)
            continue

        await asyncio.sleep(1)
