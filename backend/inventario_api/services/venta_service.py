import asyncio
from sqlalchemy.orm import Session
from ..models import Producto, Venta, DetalleVenta, MovimientoInventario
from ..models.movimiento import TipoMovimiento
from decimal import Decimal

def registrar_venta(db: Session, venta_data):
    nueva_venta = Venta(id_usuario=venta_data.id_usuario, total=0)
    db.add(nueva_venta); db.flush()

    total_venta = Decimal(0)
    productos_procesados = []

    for item in venta_data.detalles:
        producto = db.query(Producto).filter(Producto.id_producto == item.id_producto).first()
        if not producto:
            raise Exception(f"Producto {item.id_producto} no existe")
        if producto.stock_actual <= 0:
            raise Exception(f"El producto '{producto.nombre}' está agotado")
        if producto.stock_actual < item.cantidad:
            raise Exception(f"Stock insuficiente para '{producto.nombre}'. Disponible: {producto.stock_actual}")

        subtotal = Decimal(str(producto.precio_venta)) * item.cantidad
        total_venta += subtotal

        db.add(DetalleVenta(
            id_venta=nueva_venta.id_venta, id_producto=producto.id_producto,
            cantidad=item.cantidad, precio_unitario=producto.precio_venta, subtotal=subtotal
        ))
        producto.stock_actual -= item.cantidad
        db.add(MovimientoInventario(
            id_producto=producto.id_producto, id_usuario=venta_data.id_usuario,
            tipo=TipoMovimiento.SALIDA, cantidad=item.cantidad, motivo="Venta"
        ))
        productos_procesados.append({
            "nombre": producto.nombre,
            "stock_actual": producto.stock_actual,
            "stock_minimo": producto.stock_minimo,
        })

    nueva_venta.total = total_venta
    db.commit(); db.refresh(nueva_venta)

    _disparar_notificaciones(nueva_venta.id_venta, float(total_venta), len(venta_data.detalles), productos_procesados)
    return nueva_venta

def _disparar_notificaciones(id_venta, total, cantidad_productos, productos):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(_notificar_async(id_venta, total, cantidad_productos, productos))
        else:
            asyncio.run(_notificar_async(id_venta, total, cantidad_productos, productos))
    except Exception:
        pass

async def _notificar_async(id_venta, total, cantidad_productos, productos):
    from .telegram_service import notificar_venta, alerta_stock_bajo
    await notificar_venta(id_venta, total, cantidad_productos)
    for p in productos:
        if p["stock_actual"] <= p["stock_minimo"]:
            await alerta_stock_bajo(p["nombre"], p["stock_actual"], p["stock_minimo"])
