# Inventario Pro - Versión Corregida

## Cambios aplicados

### Bugs corregidos:
1. **`.env` limpio** - eliminadas credenciales reales y código Python incrustado
2. **`SECRET_KEY` segura** - se auto-genera si no está configurada; avisa por consola
3. **`ventas.py` con autenticación** - el endpoint POST /ventas ahora requiere token
4. **`venta_service.py`** - usa `TipoMovimiento.SALIDA` (Enum) en vez de string `"SALIDA"`
5. **`dependencies.py`** - eliminados imports duplicados
6. **`products.py`** - usa `model_dump()` en vez de `.dict()` (Pydantic v2)
7. **`requirements.txt`** - añadido `pymysql`, eliminado `psycopg2-binary`
8. **`database.py`** - sin credenciales hardcodeadas, error claro si falta DATABASE_URL
9. **Asistente IA** - ahora usa MCP (Model Context Protocol) con herramientas reales

### Mejora principal - IA con MCP:
El asistente IA ahora tiene 5 herramientas que Ollama/gemma3 puede llamar:
- `get_stock_status` - Estado actual de todo el inventario
- `get_top_products` - Top N productos más vendidos en X días
- `get_sales_summary` - Resumen de ventas (total, ingresos, ticket promedio)
- `get_low_stock_products` - Productos bajo el mínimo
- `get_inventory_value` - Valor total del inventario

---

## Configuración inicial

### 1. Base de datos
Edita `backend/.env` y cambia:
```
DATABASE_URL=mysql+pymysql://root:TU_PASSWORD_REAL@localhost:3306/inventario_inteligente
```

### 2. JWT Secret Key
Genera una clave segura y ponla en el `.env`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
```
SECRET_KEY=la_clave_que_generaste
```

### 3. Telegram Bot (opcional)
Para activar el bot de Telegram:

**Paso 1:** Habla con `@BotFather` en Telegram
- Envía `/newbot`
- Sigue las instrucciones y copia el token

**Paso 2:** Obtén tu chat_id
- Habla con `@userinfobot` en Telegram
- Te responderá con tu ID numérico

**Paso 3:** Configura el `.env`:
```
TELEGRAM_BOT_TOKEN=123456789:AABBcc...
TELEGRAM_CHAT_ID=987654321
```

**Paso 4:** Reinicia el servidor — el bot se inicia automáticamente.

### 4. Ollama / Asistente IA
Asegúrate de que Ollama esté corriendo:
```bash
ollama serve          # en una terminal separada
ollama pull gemma3    # solo la primera vez
```

---

## Instalación y arranque

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn inventario_api.main:app --reload

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```
