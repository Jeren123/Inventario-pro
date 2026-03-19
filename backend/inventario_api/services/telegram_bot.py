"""
Bot de Telegram con polling.
Configuracion:
  1. Habla con @BotFather -> /newbot -> copia el token a TELEGRAM_BOT_TOKEN en .env
  2. Habla con @userinfobot para obtener tu chat_id -> ponlo en TELEGRAM_CHAT_ID en .env
  3. Reinicia el servidor

Comandos:
  /start  - Bienvenida
  /stock  - Ver stock actual
  /ventas - Resumen ventas de hoy
  /entrada <id> <cant> <motivo>
  /salida  <id> <cant> <motivo>
  /buscar <nombre>
  /ayuda  - Ver comandos
"""
import os
import asyncio
import httpx
from datetime import date
from sqlalchemy import func
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from ..database import SessionLocal
from ..models import Producto, Venta, MovimientoInventario
from ..models.movimiento import TipoMovimiento

load_dotenv()

TELEGRAM_TOKEN   = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
API = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"
_ultimo_update_id = 0


async def _send(texto: str, chat_id: str = None):
    if not TELEGRAM_TOKEN:
        return
    target = chat_id or TELEGRAM_CHAT_ID
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(f"{API}/sendMessage", json={
                "chat_id": target, "text": texto, "parse_mode": "HTML",
            })
            if resp.status_code != 200:
                print(f"Telegram send error {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"Telegram send error: {e}")


def _get_db() -> Session:
    return SessionLocal()


async def cmd_start(chat_id: str):
    await _send(
        "<b>Bienvenido a InventarioPro Bot</b>\n\n"
        "<b>Comandos:</b>\n"
        "/stock - Ver stock de todos los productos\n"
        "/ventas - Resumen de ventas de hoy\n"
        "/entrada &lt;id&gt; &lt;cant&gt; &lt;motivo&gt;\n"
        "/salida &lt;id&gt; &lt;cant&gt; &lt;motivo&gt;\n"
        "/buscar &lt;nombre&gt;\n"
        "/ayuda - Ver esta lista\n\n"
        "<i>Ejemplo: /entrada 3 50 Compra a proveedor</i>", chat_id
    )


async def cmd_stock(chat_id: str):
    db = _get_db()
    try:
        productos = db.query(Producto).filter(Producto.activo == True).order_by(Producto.nombre).all()
        if not productos:
            await _send("No hay productos registrados.", chat_id); return
        lineas = ["<b>STOCK ACTUAL</b>\n"]
        for p in productos:
            icono = "BAJO" if p.stock_actual <= p.stock_minimo else "OK"
            lineas.append(f"[{p.id_producto}] <b>{p.nombre}</b> - Stock: <b>{p.stock_actual}</b> | Min: {p.stock_minimo} | ${float(p.precio_venta):.2f} [{icono}]")
        bajo = [p for p in productos if p.stock_actual <= p.stock_minimo]
        if bajo:
            lineas.append(f"\n<b>{len(bajo)} producto(s) con stock bajo</b>")
        # Enviar en trozos si es muy largo (limite Telegram: 4096 chars)
        chunk, chars = [], 0
        for linea in lineas:
            if chars + len(linea) > 3800:
                await _send("\n".join(chunk), chat_id)
                chunk, chars = [], 0
            chunk.append(linea); chars += len(linea)
        if chunk:
            await _send("\n".join(chunk), chat_id)
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
        await _send(
            f"<b>VENTAS DE HOY</b>\n\n"
            f"Ventas realizadas: <b>{len(ventas)}</b>\n"
            f"Ingresos totales: <b>${total:.2f}</b>\n"
            f"Valor inventario: <b>${valor_inv:,.2f}</b>", chat_id)
    finally:
        db.close()


async def cmd_entrada(chat_id: str, partes: list):
    if len(partes) < 3:
        await _send("Formato: /entrada &lt;id&gt; &lt;cantidad&gt; &lt;motivo&gt;\nEjemplo: /entrada 3 50 Compra a proveedor", chat_id); return
    try:
        id_producto = int(partes[0]); cantidad = int(partes[1]); motivo = " ".join(partes[2:])
    except ValueError:
        await _send("El ID y la cantidad deben ser numeros enteros.", chat_id); return
    db = _get_db()
    try:
        producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
        if not producto:
            await _send(f"No existe producto con ID {id_producto}. Usa /stock para ver los IDs.", chat_id); return
        antes = producto.stock_actual
        producto.stock_actual += cantidad
        db.add(MovimientoInventario(id_producto=id_producto, id_usuario=1, tipo=TipoMovimiento.ENTRADA, cantidad=cantidad, motivo=f"[Telegram] {motivo}"))
        db.commit()
        await _send(f"<b>ENTRADA REGISTRADA</b>\nProducto: <b>{producto.nombre}</b>\n+{cantidad} | Stock: {antes} -> <b>{producto.stock_actual}</b>\nMotivo: {motivo}", chat_id)
    finally:
        db.close()


async def cmd_salida(chat_id: str, partes: list):
    if len(partes) < 3:
        await _send("Formato: /salida &lt;id&gt; &lt;cantidad&gt; &lt;motivo&gt;\nEjemplo: /salida 3 10 Venta directa", chat_id); return
    try:
        id_producto = int(partes[0]); cantidad = int(partes[1]); motivo = " ".join(partes[2:])
    except ValueError:
        await _send("El ID y la cantidad deben ser numeros enteros.", chat_id); return
    db = _get_db()
    try:
        producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
        if not producto:
            await _send(f"No existe producto con ID {id_producto}.", chat_id); return
        if producto.stock_actual < cantidad:
            await _send(f"Stock insuficiente. Disponible: <b>{producto.stock_actual}</b> | Solicitado: <b>{cantidad}</b>", chat_id); return
        antes = producto.stock_actual
        producto.stock_actual -= cantidad
        db.add(MovimientoInventario(id_producto=id_producto, id_usuario=1, tipo=TipoMovimiento.SALIDA, cantidad=cantidad, motivo=f"[Telegram] {motivo}"))
        db.commit()
        alerta = f"\nALERTA: Stock bajo el minimo ({producto.stock_minimo})" if producto.stock_actual <= producto.stock_minimo else ""
        await _send(f"<b>SALIDA REGISTRADA</b>\nProducto: <b>{producto.nombre}</b>\n-{cantidad} | Stock: {antes} -> <b>{producto.stock_actual}</b>\nMotivo: {motivo}{alerta}", chat_id)
    finally:
        db.close()


async def cmd_buscar(chat_id: str, partes: list):
    if not partes:
        await _send("Escribe un nombre. Ejemplo: /buscar camisa", chat_id); return
    nombre = " ".join(partes)
    db = _get_db()
    try:
        productos = db.query(Producto).filter(Producto.nombre.ilike(f"%{nombre}%")).all()
        if not productos:
            await _send(f"No se encontraron productos con '{nombre}'.", chat_id); return
        lineas = [f"<b>Resultados para '{nombre}':</b>\n"]
        for p in productos:
            lineas.append(f"[{p.id_producto}] <b>{p.nombre}</b> - Stock: {p.stock_actual} | ${float(p.precio_venta):.2f}")
        await _send("\n".join(lineas), chat_id)
    finally:
        db.close()


async def procesar_mensaje(mensaje: dict):
    chat_id = str(mensaje["chat"]["id"])
    texto   = mensaje.get("text", "").strip()
    if not texto:
        return
    if TELEGRAM_CHAT_ID and chat_id != str(TELEGRAM_CHAT_ID):
        await _send("No tienes permiso para usar este bot.", chat_id); return
    partes  = texto.split()
    comando = partes[0].lower().split("@")[0]
    args    = partes[1:]
    if comando == "/start":               await cmd_start(chat_id)
    elif comando == "/stock":             await cmd_stock(chat_id)
    elif comando == "/ventas":            await cmd_ventas(chat_id)
    elif comando == "/entrada":           await cmd_entrada(chat_id, args)
    elif comando == "/salida":            await cmd_salida(chat_id, args)
    elif comando == "/buscar":            await cmd_buscar(chat_id, args)
    elif comando in ("/ayuda", "/help"):  await cmd_start(chat_id)
    else:
        await _send(f"Comando no reconocido: <code>{comando}</code>\nEscribe /ayuda para ver los comandos.", chat_id)


async def polling_loop():
    global _ultimo_update_id
    if not TELEGRAM_TOKEN:
        print("TELEGRAM_BOT_TOKEN no configurado - bot desactivado.")
        print("Para activarlo: configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en el .env")
        return

    # Verificar token antes de iniciar
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{API}/getMe")
            if resp.status_code != 200:
                print(f"Token de Telegram invalido: {resp.text}")
                print("Verifica TELEGRAM_BOT_TOKEN en el .env")
                return
            bot_info = resp.json().get("result", {})
            print(f"Telegram Bot activo: @{bot_info.get('username', 'desconocido')}")
    except Exception as e:
        print(f"No se pudo conectar a Telegram: {e}")
        return

    print("Telegram Bot escuchando mensajes...")
    while True:
        try:
            async with httpx.AsyncClient(timeout=35) as client:
                resp = await client.get(f"{API}/getUpdates", params={
                    "offset": _ultimo_update_id + 1,
                    "timeout": 25,
                    "allowed_updates": ["message"],
                })
                if resp.status_code == 200:
                    for update in resp.json().get("result", []):
                        _ultimo_update_id = update["update_id"]
                        if "message" in update:
                            await procesar_mensaje(update["message"])
                elif resp.status_code == 401:
                    print("Token de Telegram invalido o revocado. Deteniendo bot.")
                    return
        except asyncio.CancelledError:
            print("Telegram Bot detenido.")
            break
        except httpx.TimeoutException:
            continue  # timeout normal del long-polling
        except Exception as e:
            print(f"Error en polling: {e}. Reintentando en 5s...")
            await asyncio.sleep(5)
