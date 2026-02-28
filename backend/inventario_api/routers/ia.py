import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from ..core.dependencies import admin_o_vendedor
from ..models import Usuario

router = APIRouter(prefix="/ia", tags=["Asistente IA"])

GEMINI_API_KEY = "AIzaSyDPLf2KSvLm30qgaEC6-ufWp_IPL15izoU"  # <-- mi API key de Gemini
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


class Mensaje(BaseModel):
    role: str   # "user" o "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Mensaje]
    contexto_inventario: str = ""


@router.post("/chat")
async def chat_ia(
    req: ChatRequest,
    user: Usuario = Depends(admin_o_vendedor)
):
    if not GEMINI_API_KEY or "XXXX" in GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY no está configurada en el servidor."
        )

    # Construir historial de mensajes en formato Gemini
    contents = []

    # Instrucciones del sistema como primer mensaje
    system_text = (
        "Eres un asistente experto en gestión de inventarios y negocios. "
        "Respondes SIEMPRE en español de forma clara, concisa y útil. "
        "Tienes acceso al inventario actual del negocio y ayudas con análisis, "
        "recomendaciones, alertas de stock y estrategias comerciales. "
        "Usa emojis ocasionalmente para hacer las respuestas más amigables. "
        "Nunca inventes datos que no estén en el contexto proporcionado."
    )
    if req.contexto_inventario:
        system_text += f"\n\nINVENTARIO ACTUAL:\n{req.contexto_inventario}"

    contents.append({
        "role": "user",
        "parts": [{"text": system_text}]
    })
    contents.append({
        "role": "model",
        "parts": [{"text": "Entendido, estoy listo para ayudarte con tu inventario."}]
    })

    # Agregar historial de la conversación
    for m in req.messages:
        role = "model" if m.role == "assistant" else "user"
        contents.append({
            "role": role,
            "parts": [{"text": m.content}]
        })

    payload = {
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": 1000,
            "temperature": 0.7,
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json=payload,
                headers={"content-type": "application/json"},
            )

            print("STATUS:", response.status_code)
            print("RESPUESTA:", response.text)

            response.raise_for_status()
            data = response.json()

            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"reply": reply}

        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Error de la API de Gemini: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")