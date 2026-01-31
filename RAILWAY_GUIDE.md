# 🚀 Guía de Despliegue en Railway - NexoBot AI

Para que NexoBot funcione al **150% de estabilidad**, sigue estos pasos para desplegar en Railway.app.

## 1. Preparar Cuenta en Railway
1. Crea una cuenta en [Railway.app](https://railway.app).
2. Conecta tu GitHub.

## 2. Desplegar el Backend (El Cerebro)
1. Haz clic en **"New Project"** ➔ **"Deploy from GitHub repo"**.
2. Selecciona tu repositorio de NexoBot.
3. **IMPORTANTE:** Cuando se cree el servicio, ve a **Settings** ➔ **Root Directory** y pon: `/backend`.
4. Ve a **Variables** y añade estas (las más importantes):
   - `DATABASE_URL`: (Railway te permite crear una base de datos PostgreSQL interna, ¡úsala!).
   - `GEMINI_API_KEY`: Tu clave de Google AI.
   - `WHATSAPP_EVOLUTION_URL`: La URL de tu servidor de WhatsApp (Evolution API).
   - `WHATSAPP_EVOLUTION_API_KEY`: Tu clave de API.
   - `SECRET_KEY`: Una cadena larga aleatoria.
5. Railway detectará el archivo `requirements.txt` y lanzará el servidor automáticamente.

## 3. Desplegar el Frontend (La Interfaz)
1. En el mismo proyecto de Railway, haz clic en **"New"** ➔ **"GitHub Repo"** (el mismo repo).
2. Ve a **Settings** ➔ **Root Directory** y pon: `/frontend`.
3. Renombra este servicio a `frontend` para identificarlo.
4. Ve a **Variables** y añade:
   - `NEXT_PUBLIC_API_URL`: La URL que Railway le asignó a tu **Backend** (ej: `https://backend-production.up.railway.app`).
5. Railway detectará Next.js y lo compilará.

## 4. Base de Datos Profesional (Opcional pero Recomendado)
1. Dentro de tu proyecto en Railway, haz clic en **"New"** ➔ **"Database"** ➔ **"Add PostgreSQL"**.
2. Railway conectará automáticamente el Backend con esta base de datos si usas el nombre de variable `DATABASE_URL`.

---

### ✅ ¿Por qué esto es mejor?
- **No se duerme:** A diferencia de Render, Railway mantiene la app encendida siempre.
- **Auto-healing:** Si algo falla, Railway reinicia el bot automáticamente en milisegundos.
- **Escalable:** Si mañana tienes 500 clientes, solo deslizas una barra y Railway le da más potencia a NexoBot.

---
*Guía generada por Antigravity para asegurar el éxito de tu negocio.*
