# Product Requirements Document (PRD): Bizmuth 🚀

## 1. Visión del Producto
**Bizmuth** es el "Cerebro Operativo" para emprendedores que venden en redes sociales. No es solo un chatbot; es un asistente con ejecución real que gestiona citas, factura, lleva la contabilidad y recuerda cada detalle de los clientes mediante IA.

## 2. Objetivos Estratégicos
- **Productividad**: Reducir el tiempo administrativo en un 80%.
- **Ventas**: Capturar leads y cerrar citas/pagos 24/7 en WhatsApp/Instagram.
- **Inteligencia**: Ofrecer insights personalizados basados en el historial del negocio (RAG).

## 3. Funcionalidades Core

### A. Interfaz Conversacional (Omnicanal)
- Chat centralizado que entiende lenguaje natural.
- Capacidad de procesar notas de voz (Voice-to-Action).
- Integración con WhatsApp Business API e Instagram DM.

### B. Gestión de Citas Multi-tenant
- Sincronización bi-direccional con Google Calendar y Outlook.
- Lógica de disponibilidad dinámica basada en servicios y empleados.
- Recordatorios automáticos vía WhatsApp para reducir "no-shows".

### C. Facturación y Contabilidad IA
- Generación de facturas PDF profesionales al instante.
- Registro automático de ingresos/egresos mediante chat ("Registra gasto de 50€ en luz").
- Tablero de control financiero (Profit/Loss).

### D. Memoria Contextual (RAG - Retrieval Augmented Generation)
- Base de Datos Vectorial para almacenar preferencias de clientes.
- Ejemplo: "A Juan le gusta el café con leche y su última cita fue un corte degradado".
- Búsqueda semántica sobre el historial de conversaciones.

### E. Soporte Multi-idioma (Internacionalización)
- **Idiomas Core**: Español, Inglés, Alemán, Italiano, Francés.
- **Arquitectura Extensible**: Capacidad para añadir nuevos idiomas mediante archivos de traducción (i18n).
- **IA Políglota**: El asistente responderá automáticamente en el idioma en que se le hable.

### F. Interfaz de Selección de Industria
- Basado en las imágenes de referencia, el usuario podrá elegir su sector mediante una cuadrícula de iconos intuitivos (Barbería, Dentista, Legal, Inmobiliaria).

## 4. Requerimientos Técnicos

### Tech Stack Recomendado
- **Backend**: FastAPI (Python) - Por su velocidad y ecosistema de IA.
- **Frontend Web**: Next.js + Tailwind CSS + Framer Motion (Animaciones).
- **Idiomas**: i18next o sistema de diccionarios JSON.
- **LLM**: Google Gemini 2.0 Flash (Multilingüe nativo).
- **Infraestructura**: AWS o Vercel/Supabase para escalabilidad rápida.

### Arquitectura Multi-tenant
- **Estrategia**: Identificador `tenant_id` en todas las tablas clave.
- **Seguridad**: Row Level Security (RLS) en el motor de base de datos para asegurar el aislamiento total entre negocios.

## 5. Flujo de Usuario: Creación de Factura por Voz
1. **Input**: "Oye Bizmuth, genérame una factura para Carlos Pérez por la limpieza dental de hoy, son 60 euros".
2. **Procesamiento**: El backend usa Whisper para transcribir y GPT-4o para extraer entidades (Cliente, Concepto, Monto).
3. **Validación**: El asistente confirma datos: "¿Confirmo factura para Carlos por 60€?".
4. **Ejecución**: 
   - Se crea el registro en la DB de contabilidad.
   - Se genera el PDF usando una plantilla.
   - Se envía automáticamente por WhatsApp al cliente.
5. **Feedback**: "Listo. Factura #102 enviada a Carlos y registrada en tus ingresos".

## 6. Estrategia de Go-To-Market
- **Gancho Viral**: "Tu Siri para los Negocios".
- **Demo de Impacto**: Video de 15 segundos: nota de voz -> calendario bloqueado -> factura enviada.
- **Pricing**: $9.99/mes (Acceso Total) con 3 días de prueba GRATIS.
