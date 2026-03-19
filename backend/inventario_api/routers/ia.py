import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from ..core.dependencies import admin_o_vendedor, get_db
from ..models import Usuario, Producto, Venta, DetalleVenta

router = APIRouter(prefix="/ia", tags=["Asistente IA"])

OLLAMA_URL   = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")


def build_inventory_context(db: Session) -> str:
    """Construye un resumen del inventario para incluir en el system prompt."""
    try:
        productos = db.query(Producto).filter(Producto.activo == True).all()
        if not productos:
            return "No hay productos en el inventario."

        # Resumen general
        valor_total = sum(float(p.precio_venta) * p.stock_actual for p in productos)
        stock_bajo = [p for p in productos if p.stock_actual <= p.stock_minimo]

        # Ventas últimos 7 días
        hace_7d = datetime.now() - timedelta(days=7)
        ventas_semana = db.query(Venta).filter(Venta.fecha >= hace_7d).all()
        ingresos_semana = sum(float(v.total) for v in ventas_semana)

        # Top 5 productos vendidos (últimos 30 días)
        hace_30d = datetime.now() - timedelta(days=30)
        top = (
            db.query(Producto.nombre, func.sum(DetalleVenta.cantidad).label("total"))
            .join(DetalleVenta, Producto.id_producto == DetalleVenta.id_producto)
            .join(Venta, DetalleVenta.id_venta == Venta.id_venta)
            .filter(Venta.fecha >= hace_30d)
            .group_by(Producto.id_producto, Producto.nombre)
            .order_by(desc("total"))
            .limit(5).all()
        )

        # Construir texto del contexto
        lineas = [
            f"=== INVENTARIO ACTUAL ({datetime.now().strftime('%d/%m/%Y %H:%M')}) ===",
            f"Total productos activos: {len(productos)}",
            f"Valor total inventario: ${valor_total:,.2f}",
            f"Productos con stock bajo: {len(stock_bajo)}",
            f"Ventas esta semana: {len(ventas_semana)} ventas | ${ingresos_semana:.2f} ingresos",
            "",
            "--- PRODUCTOS ---",
        ]

        for p in productos:
            estado = "STOCK BAJO" if p.stock_actual <= p.stock_minimo else "ok"
            lineas.append(
                f"[ID:{p.id_producto}] {p.nombre} | stock:{p.stock_actual} | "
                f"minimo:{p.stock_minimo} | precio_venta:${float(p.precio_venta):.2f} | "
                f"precio_compra:${float(p.precio_compra):.2f} | estado:{estado}"
            )

        if stock_bajo:
            lineas.append("")
            lineas.append("--- ALERTAS STOCK BAJO ---")
            for p in stock_bajo:
                lineas.append(f"  - {p.nombre}: tiene {p.stock_actual}, necesita {p.stock_minimo}")

        if top:
            lineas.append("")
            lineas.append("--- TOP PRODUCTOS MAS VENDIDOS (30 dias) ---")
            for i, t in enumerate(top, 1):
                lineas.append(f"  {i}. {t.nombre}: {int(t.total)} unidades vendidas")

        return "\n".join(lineas)

    except Exception as e:
        return f"Error al obtener inventario: {e}"


class Mensaje(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Mensaje]


@router.get("/status")
async def ollama_status():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_URL}/api/tags")
            if resp.status_code != 200:
                return {"ok": False, "error": "Ollama no responde"}
            modelos = [m["name"] for m in resp.json().get("models", [])]
            modelo_disponible = any(OLLAMA_MODEL in m for m in modelos)
            return {
                "ok": modelo_disponible,
                "ollama_url": OLLAMA_URL,
                "modelo": OLLAMA_MODEL,
                "modelos_disponibles": modelos,
                "mensaje": "Listo" if modelo_disponible else (
                    f"Modelo '{OLLAMA_MODEL}' no encontrado. "
                    f"Ejecuta: ollama pull {OLLAMA_MODEL}"
                )
            }
    except Exception as e:
        return {"ok": False, "error": f"No se puede conectar a Ollama en {OLLAMA_URL}", "detalle": str(e)}


@router.post("/chat")
async def chat_ia(
    req: ChatRequest,
    db: Session = Depends(get_db),
    user: Usuario = Depends(admin_o_vendedor)
):
    # Obtener contexto real del inventario desde la base de datos
    contexto = build_inventory_context(db)

    system_prompt = (
        "Eres un asistente experto en gestion de inventarios y negocios. "
        "Respondes SIEMPRE en espanol, de forma clara y util. "
        "Usa los datos del inventario que se te proporcionan para responder con precision. "
        "Nunca inventes datos que no esten en el contexto. "
        "Si el usuario pregunta sobre stock, ventas o productos, usa los datos del inventario. "
        "Puedes dar recomendaciones, analisis y estrategias basadas en los datos reales.\n\n"
        + contexto
    )

    messages = [{"role": "system", "content": system_prompt}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 1024,
        }
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            data = response.json()

            reply = data.get("message", {}).get("content", "")
            if not reply:
                raise HTTPException(status_code=502, detail="Respuesta vacia de Ollama.")
            return {"reply": reply}

        except httpx.ConnectError:
            raise HTTPException(
                status_code=503,
                detail=f"No se puede conectar a Ollama en {OLLAMA_URL}. Ejecuta: ollama serve"
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Ollama tardo demasiado. El modelo puede estar cargando, intenta de nuevo en unos segundos."
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Error de Ollama: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
