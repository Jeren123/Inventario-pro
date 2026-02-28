from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from ..database import SessionLocal
from ..models import Producto, Venta, DetalleVenta, MovimientoInventario
from ..core.dependencies import solo_admin
from ..models.usuario import Usuario

router = APIRouter(prefix="/reportes", tags=["Reportes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    """Datos completos para el dashboard con gráficas."""

    hoy = datetime.now()
    hace_30_dias = hoy - timedelta(days=30)
    hace_7_dias = hoy - timedelta(days=7)

    # ── Totales generales ────────────────────────────────────────────────────
    total_productos = db.query(Producto).count()
    productos_activos = db.query(Producto).filter(Producto.activo == True).count()
    stock_bajo = db.query(Producto).filter(
        Producto.stock_actual <= Producto.stock_minimo
    ).count()

    valor_inventario = db.query(
        func.sum(Producto.precio_venta * Producto.stock_actual)
    ).scalar() or 0

    # ── Ventas últimos 30 días ────────────────────────────────────────────────
    ventas_mes = db.query(func.count(Venta.id_venta), func.sum(Venta.total)).filter(
        Venta.fecha >= hace_30_dias
    ).first()

    ventas_semana = db.query(func.count(Venta.id_venta), func.sum(Venta.total)).filter(
        Venta.fecha >= hace_7_dias
    ).first()

    # ── Ventas por día (últimos 14 días) ─────────────────────────────────────
    hace_14_dias = hoy - timedelta(days=14)
    ventas_por_dia_raw = db.query(
        func.date(Venta.fecha).label("dia"),
        func.count(Venta.id_venta).label("cantidad"),
        func.sum(Venta.total).label("total")
    ).filter(Venta.fecha >= hace_14_dias).group_by(
        func.date(Venta.fecha)
    ).order_by("dia").all()

    ventas_por_dia = [
        {"dia": str(r.dia), "cantidad": r.cantidad, "total": float(r.total or 0)}
        for r in ventas_por_dia_raw
    ]

    # ── Top 5 productos más vendidos ─────────────────────────────────────────
    top_productos_raw = db.query(
        Producto.nombre,
        func.sum(DetalleVenta.cantidad).label("total_vendido"),
        func.sum(DetalleVenta.subtotal).label("ingreso")
    ).join(DetalleVenta, Producto.id_producto == DetalleVenta.id_producto
    ).group_by(Producto.id_producto, Producto.nombre
    ).order_by(desc("total_vendido")).limit(5).all()

    top_productos = [
        {"nombre": r.nombre, "total_vendido": int(r.total_vendido), "ingreso": float(r.ingreso or 0)}
        for r in top_productos_raw
    ]

    # ── Productos con stock bajo ──────────────────────────────────────────────
    productos_stock_bajo = db.query(Producto).filter(
        Producto.stock_actual <= Producto.stock_minimo,
        Producto.activo == True
    ).all()

    stock_bajo_lista = [
        {
            "nombre": p.nombre,
            "stock_actual": p.stock_actual,
            "stock_minimo": p.stock_minimo,
            "precio_venta": float(p.precio_venta)
        }
        for p in productos_stock_bajo
    ]

    # ── Distribución de stock por producto (top 8) ───────────────────────────
    distribucion_stock = db.query(Producto).filter(
        Producto.activo == True
    ).order_by(desc(Producto.stock_actual)).limit(8).all()

    dist_stock = [
        {"nombre": p.nombre, "stock": p.stock_actual}
        for p in distribucion_stock
    ]

    return {
        "resumen": {
            "total_productos": total_productos,
            "productos_activos": productos_activos,
            "stock_bajo": stock_bajo,
            "valor_inventario": float(valor_inventario),
            "ventas_mes_cantidad": ventas_mes[0] or 0,
            "ventas_mes_total": float(ventas_mes[1] or 0),
            "ventas_semana_cantidad": ventas_semana[0] or 0,
            "ventas_semana_total": float(ventas_semana[1] or 0),
        },
        "ventas_por_dia": ventas_por_dia,
        "top_productos": top_productos,
        "stock_bajo_lista": stock_bajo_lista,
        "distribucion_stock": dist_stock,
    }


@router.get("/prediccion")
def get_prediccion(db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    """Predicción de demanda basada en historial de ventas."""

    hoy = datetime.now()
    hace_30_dias = hoy - timedelta(days=30)
    hace_60_dias = hoy - timedelta(days=60)

    # Ventas por producto en los últimos 30 días
    ventas_recientes = db.query(
        Producto.id_producto,
        Producto.nombre,
        Producto.stock_actual,
        Producto.stock_minimo,
        Producto.precio_compra,
        func.sum(DetalleVenta.cantidad).label("vendido_30d")
    ).join(DetalleVenta, Producto.id_producto == DetalleVenta.id_producto
    ).join(Venta, DetalleVenta.id_venta == Venta.id_venta
    ).filter(Venta.fecha >= hace_30_dias
    ).group_by(
        Producto.id_producto, Producto.nombre,
        Producto.stock_actual, Producto.stock_minimo, Producto.precio_compra
    ).all()

    # Ventas por producto en los 30 días anteriores (para comparar tendencia)
    ventas_anteriores = db.query(
        Producto.id_producto,
        func.sum(DetalleVenta.cantidad).label("vendido_prev")
    ).join(DetalleVenta, Producto.id_producto == DetalleVenta.id_producto
    ).join(Venta, DetalleVenta.id_venta == Venta.id_venta
    ).filter(Venta.fecha >= hace_60_dias, Venta.fecha < hace_30_dias
    ).group_by(Producto.id_producto).all()

    prev_dict = {r.id_producto: int(r.vendido_prev) for r in ventas_anteriores}

    predicciones = []
    for r in ventas_recientes:
        vendido_30d = int(r.vendido_30d)
        vendido_prev = prev_dict.get(r.id_producto, vendido_30d)

        # Tasa diaria de venta
        tasa_diaria = vendido_30d / 30

        # Días de stock restante
        dias_stock = int(r.stock_actual / tasa_diaria) if tasa_diaria > 0 else 999

        # Tendencia
        if vendido_prev > 0:
            tendencia = ((vendido_30d - vendido_prev) / vendido_prev) * 100
        else:
            tendencia = 0

        # Cantidad recomendada a comprar (30 días de stock + buffer 20%)
        cantidad_recomendada = max(0, int((tasa_diaria * 30 * 1.2) - r.stock_actual))

        # Urgencia
        if dias_stock <= 7:
            urgencia = "critica"
        elif dias_stock <= 15:
            urgencia = "alta"
        elif dias_stock <= 30:
            urgencia = "media"
        else:
            urgencia = "ok"

        predicciones.append({
            "nombre": r.nombre,
            "stock_actual": r.stock_actual,
            "vendido_30d": vendido_30d,
            "tasa_diaria": round(tasa_diaria, 2),
            "dias_stock_restante": dias_stock,
            "tendencia_pct": round(tendencia, 1),
            "cantidad_recomendada": cantidad_recomendada,
            "costo_reposicion": round(cantidad_recomendada * float(r.precio_compra), 2),
            "urgencia": urgencia,
        })

    # Ordenar por urgencia
    orden_urgencia = {"critica": 0, "alta": 1, "media": 2, "ok": 3}
    predicciones.sort(key=lambda x: (orden_urgencia[x["urgencia"]], x["dias_stock_restante"]))

    costo_total = sum(p["costo_reposicion"] for p in predicciones if p["urgencia"] in ["critica", "alta"])

    return {
        "predicciones": predicciones,
        "resumen": {
            "criticos": sum(1 for p in predicciones if p["urgencia"] == "critica"),
            "alta_prioridad": sum(1 for p in predicciones if p["urgencia"] == "alta"),
            "costo_urgente": round(costo_total, 2),
        }
    }


@router.get("/pdf-data")
def get_pdf_data(db: Session = Depends(get_db), user: Usuario = Depends(solo_admin)):
    """Datos completos para generar el PDF del reporte."""

    hoy = datetime.now()
    hace_30_dias = hoy - timedelta(days=30)

    productos = db.query(Producto).filter(Producto.activo == True).all()
    ventas = db.query(Venta).filter(Venta.fecha >= hace_30_dias).all()

    top_productos_raw = db.query(
        Producto.nombre,
        func.sum(DetalleVenta.cantidad).label("total_vendido"),
        func.sum(DetalleVenta.subtotal).label("ingreso")
    ).join(DetalleVenta, Producto.id_producto == DetalleVenta.id_producto
    ).group_by(Producto.id_producto, Producto.nombre
    ).order_by(desc("total_vendido")).limit(10).all()

    return {
        "fecha_generacion": hoy.strftime("%d/%m/%Y %H:%M"),
        "periodo": f"{hace_30_dias.strftime('%d/%m/%Y')} - {hoy.strftime('%d/%m/%Y')}",
        "resumen": {
            "total_productos": len(productos),
            "valor_inventario": float(sum(float(p.precio_venta) * p.stock_actual for p in productos)),
            "total_ventas_mes": len(ventas),
            "ingreso_mes": float(sum(float(v.total) for v in ventas)),
            "productos_stock_bajo": sum(1 for p in productos if p.stock_actual <= p.stock_minimo),
        },
        "productos": [
            {
                "nombre": p.nombre,
                "stock_actual": p.stock_actual,
                "stock_minimo": p.stock_minimo,
                "precio_venta": float(p.precio_venta),
                "precio_compra": float(p.precio_compra),
                "valor_stock": float(p.precio_venta) * p.stock_actual,
                "estado": "⚠ Stock bajo" if p.stock_actual <= p.stock_minimo else "✓ Normal"
            }
            for p in productos
        ],
        "top_productos": [
            {"nombre": r.nombre, "total_vendido": int(r.total_vendido), "ingreso": float(r.ingreso or 0)}
            for r in top_productos_raw
        ],
    }
