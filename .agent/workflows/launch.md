---
description: Guía definitiva para lanzar NexoBot AI al universo (Vercel + Render)
---

### 🚀 Workflow de Lanzamiento NexoBot AI

Sigue estos pasos para que la aplicación esté operativa en menos de 5 minutos:

#### 1. Preparación del Backend (Render/Vercel)
Asegúrate de configurar las siguientes variables de entorno en tu panel de control de Hosting:
- `DATABASE_URL`: Tu cadena de conexión de Supabase o Neon.
- `GEMINI_API_KEY`: Tu clave de Google AI Studio.
- `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe para cobros.
- `SMTP_USER`: Tu correo de Gmail para alertas.
- `SMTP_PASSWORD`: Tu Contraseña de Aplicación de Google.
- `VERCEL`: `1` (Solo si despliegas en Vercel para activar el modo /tmp).

#### 2. Preparación del Frontend (Vercel)
En el dashboard de Vercel del proyecto Frontend:
- `NEXT_PUBLIC_API_URL`: La URL de tu backend desplegado (ej: `https://tu-backend.render.com`).

#### 3. Sincronización de Base de Datos
Si es la primera vez que despliegas, el sistema inicializará las tablas automáticamente al arrancar. Si necesitas datos de prueba:
// turbo
- `cd backend && python seed.py`

#### 4. Verificación de Seguridad
- El sistema tiene configurados los 3 días de prueba obligatorios.
- El botón de "Cancelar suscripción" es visible para los usuarios activos.
- Las alertas de emergencia están dirigidas a tu Gmail configurado.

#### 5. ¡Lanzamiento!
Realiza un commit y push a tu repositorio principal:
```bash
git add .
git commit -m "🚀 Lanzamiento Oficial NexoBot AI - Versión Premium"
git push origin main
```

¡Felicidades, NexoBot está en vivo! 🥂
