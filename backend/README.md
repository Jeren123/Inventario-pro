# Inventario Pro — Backend

API REST construida con **FastAPI** + **SQLAlchemy** + **PostgreSQL**.

## Requisitos

- Python 3.11+
- PostgreSQL

## Configuración

1. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Edita `.env` con tus valores reales.

3. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Levanta el servidor:
   ```bash
   ./start.sh
   # o directamente:
   uvicorn inventario_api.main:app --reload
   ```

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `SECRET_KEY` | Clave secreta para JWT (mínimo 32 caracteres) |
| `GEMINI_API_KEY` | API Key de Google Gemini para el asistente IA |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `TELEGRAM_CHAT_ID` | ID del chat donde se envían las alertas |

## Endpoints principales

- `POST /auth/login` — Autenticación
- `GET /productos/` — Listar productos
- `GET /reportes/dashboard` — Datos del dashboard
- `POST /ia/chat` — Chat con el asistente IA
- `GET /docs` — Documentación interactiva (Swagger UI)
