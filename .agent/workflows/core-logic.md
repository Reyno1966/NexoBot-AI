---
description: Memoria del sistema y lógica core de NexoBot AI
---

# 🧠 NexoBot AI Core Logic & Architecture

Este documento sirve como la memoria central de las modificaciones y la arquitectura implementada para mantener la coherencia en el desarrollo futuro.

## 🏗️ Arquitectura General
- **Frontend**: Next.js (App Router) con arquitectura modular. Componentes clave en `frontend/src/app/components/`:
  - `Sidebar.js`: Navegación inteligente, selector de idiomas y métricas en vivo.
  - `DashboardContent.js`: Renderizado dinámico de pestañas, incluyendo **Inbox IA** e **insights Proactivos**.
  - `AIChatAssistant.js`: Interfaz de chat del asistente inteligente con soporte multimedia y voz.
  - `SettingsModal.js`: Configuración granular multi-tenant (Stripe, WhatsApp, SMTP, Colores).
- **Backend**: FastAPI con SQLModel (PostgreSQL/SQLite).
- **Notificaciones**: Sistema híbrido (SMTP / Resend / WhatsApp Gateway).
- **Multi-Tenant**: Aislamiento total de datos por `tenant_id`.

## 🛰️ Sistema de Conectividad e Inteligencia
1. **WhatsApp Gateway (Evolution API)**:
   - **Lógica**: Cada negocio tiene su propia instancia dedicada.
   - **Inbox IA (Beta)**: Nuevo sistema para monitorear en tiempo real las conversaciones atendidas por la IA y permitir intervención humana sugerida.

2. **Insights Proactivos**:
   - Algoritmo en el frontend (preparado para integración con backend) que analiza datos de clientes y suscripciones para sugerir estrategias comerciales automáticas.

3. **Email y Calendario**:
   - Integración con Resend (prioritaria) y Google Calendar para sincronización de citas.

## 🎨 Lógica de Diseño Premium (White Label)
- **Estética "Stunning"**: Uso de `Mesh Gradients` animados y `Glassmorphism` intenso (`backdrop-blur-xl`).
- **Marca Blanca**: Los colores `primary_color` y `secondary_color` ahora se aplican dinámicamente en la interfaz.
- **Identidad**: Iconografía reactiva según la industria seleccionada (Barbería, Salud, Legal, etc.).

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
