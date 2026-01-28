# 🧠 Memoria del Proyecto: NexoBot AI

Este documento sirve como ancla de memoria para el desarrollo continuo de NexoBot AI. Contiene la arquitectura actual, decisiones técnicas y la hoja de ruta establecida.

## 🚀 Estado Actual del Proyecto
NexoBot AI ha evolucionado de un asistente simple a una plataforma **SaaS Multi-tenant** (Software as a Service) diseñada para que múltiples negocios gestionen su operación con IA.

### 🛠️ Stack Tecnológico
- **Frontend**: Next.js 14+, Tailwind CSS (Glassmorphism UI), Framer Motion (Animaciones).
- **Backend**: FastAPI (Python), SQLModel (ORM), PostgreSQL (Supabase/Neon).
- **AI Core**: Google Gemini 2.0 Flash (SDK `google-genai`).
- **Despliegue**: Frontend en Vercel, Backend en Render.

## 💎 Funcionalidades Implementadas
1. **Chat Inteligente RAG**: El bot conoce los servicios, horarios y stock de cada negocio.
2. **Gestión de Citas (Bookings)**: Registro automático de citas y transacciones desde el chat público.
3. **Multi-Tenancy Real**: Aislamiento de datos entre negocios mediante `tenant_id`.
4. **Sistema de Notificaciones Robusto**: Alertas por Email y WhatsApp (Logs/API).
5. **Conectividad Personalizada**: Cada dueño de negocio puede configurar su propio SMTP y API de WhatsApp desde el Dashboard.
6. **Generación de Documentos**: Creación de Facturas y Contratos en PDF en tiempo real.

## 🔧 Correcciones Críticas Recientes
- **Icon Crash**: Solucionado el ReferenceError por falta de importaciones de Lucide (`Zap`, `Clock`, `User`).
- **Atribución de Datos**: Corregido el error de asociación donde los chats se guardaban en la cuenta de prueba en lugar de la cuenta del usuario real.
- **Flujo de Registro**: Optimizado para activar notificaciones por defecto y asegurar la creación del Tenant al registrarse.
- **Admin Email Lookup**: Mejorada la búsqueda del correo del administrador para garantizar la entrega de alertas.

## 📍 Datos de Prueba Actualizados
- **Usuario Principal**: `younailssalento@gmail.com`
- **Dashboard URL**: `https://nexo-bot-ai.vercel.app/`
- **Backend URL**: `https://nexobot-ai.onrender.com`

## 🛤️ Hoja de Ruta (Roadmap)
- [ ] **Stripe Connect**: Permitir que los clientes reciban pagos directamente.
- [ ] **Almacenamiento Persistente**: Migrar PDFs de `/tmp` a AWS S3 o Google Cloud Storage.
- [ ] **Integración Real de WhatsApp**: Conectar con Evolution API o Twilio para mensajes reales.
- [ ] **Google Calendar Sync**: Sincronizar citas automáticamente con el calendario del celular del dueño.

---
*Ultima actualización: 28 de Enero, 2026*
