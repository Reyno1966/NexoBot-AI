---
description: Memoria del sistema y lógica core de NexoBot AI
---

# 🧠 NexoBot AI Core Logic & Architecture

Este documento sirve como la memoria central de las modificaciones y la arquitectura implementada para mantener la coherencia en el desarrollo futuro.

## 🏗️ Arquitectura General
- **Frontend**: Next.js (App Router) con Tailwind CSS y Framer Motion para una experiencia premium.
- **Backend**: FastAPI con SQLModel (PostgreSQL/SQLite).
- **Notificaciones**: Sistema híbrido (SMTP / Resend / WhatsApp Gateway).
- **Multi-Tenant**: La lógica se basa en el ID del `tenant` (negocio) para aislar configuraciones, clientes y chats.

## 📡 Sistema de Conectividad (White Label)
1. **WhatsApp Gateway (Evolution API)**:
   - **Lógica**: Cada negocio tiene su propia instancia identificada por `tenant_{uuid}`.
   - **Servicio**: `backend/app/services/whatsapp_service.py` gestiona la creación de instancias, obtención de QR y estado de conexión.
   - **Frontend**: Polling automático cada 5 segundos cuando el modal de ajustes está abierto para detectar la vinculación exitosa.

2. **Email Profesional**:
   - **SMTP**: Compatible con Gmail (Password de Aplicación) y servidores genéricos.
   - **Resend**: Integración premium si el `resend_api_key` está presente. El sistema prioriza Resend sobre SMTP.

3. **Google Calendar**:
   - Campos `google_calendar_token` añadidos al modelo `Tenant`.
   - Interfaz preparada en la pestaña de "Mi Negocio".

## 🎨 Lógica de Diseño (White Label)
- Se han implementado campos `primary_color` y `secondary_color` en el modelo `Tenant`.
- El frontend carga estos colores en el estado `businessConfig`. (Próximo paso: aplicarlos dinámicamente a las variables CSS de Tailwind).

## 📊 Sistema de Analíticas y Finanzas
- **Gráfico de Crecimiento**: Implementado en la pestaña "Finanzas" usando `Recharts`.
- **Procesamiento**: El frontend reduce el array de `transactions` del `dashboardData` para agrupar por mes y mostrar el balance neto.

## 🔔 Servicio de Notificaciones
- Ubicación: `backend/app/services/notification_service.py`.
- **Flujo**: NexoBot detecta `intents` (citas, facturas, soporte) -> Notifica al dueño vía WhatsApp y Email usando la configuración específica de su negocio.

## 💾 Persistencia de Datos
- **Migraciones**: El archivo `backend/app/db.py` contiene parches `ALTER TABLE` para asegurar que las nuevas columnas (Stripe, WhatsApp, Colores, etc.) se creen automáticamente en el despliegue.

## 🛠️ Reglas de Desarrollo
1. **Seguridad**: Siempre usar `tenant_id` del token JWT para filtrar peticiones al backend.
2. **Estética**: Mantener el diseño "Premium Dark" con bordes redondeados (`rounded-3xl`) y efectos de cristal (`backdrop-blur`).
3. **Consistencia**: Cualquier cambio en el modelo `Tenant` debe reflejarse en `backend/app/schemas/auth.py` y actualizar el `setBusinessConfig` en el frontend.
