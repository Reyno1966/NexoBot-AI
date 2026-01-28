# NexoBot 🤖💼 - Tu Asistente de Negocios Inteligente
> 🚀 **Lanzamiento Oficial: Versión Premium - Enero 2026**

¡Bienvenido a **NexoBot**! El cerebro operativo diseñado para emprendedores modernos. NexoBot no solo chatea; ejecuta, recuerda y gestiona tu negocio desde la palma de tu mano.

## 🌟 Características Destacadas
- **IA de Vanguardia**: Impulsado por Google **Gemini 2.0 Flash**.
- **Diseño Premium**: Interfaz móvil optimizada con estilos de cristal y modo oscuro.
- **Multimodal**: Capacidad para analizar imágenes y documentos (próximamente).
- **Memoria Real**: Recuerda preferencias de clientes mediante integración de base de datos.
- **Facturación Instantánea**: Genera PDFs de facturas solo con tu voz.

## 🛠️ Estructura del Proyecto
- `/backend`: Servidor FastAPI con lógica de IA y Base de Datos (SQLModel).
- `/frontend`: Aplicación web moderna (Next.js) con diseño optimizado para móviles.
- `.agent/workflows/core-logic.md`: **Memoria del Sistema** y lógica técnica actualizada.
- `/docs`: Documentación detallada y PRD.

## 🚀 Cómo empezar

### 1. Configuración del Backend
```bash
cd backend
# Asegúrate de tener Python 3.10+
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Crea tu .env con tu GEMINI_API_KEY
python3 seed.py  # Crea datos de prueba
uvicorn app.main:app --reload
```

### 2. Configuración del Frontend
```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:3000` en su navegador (active el modo móvil en el inspector para la mejor experiencia).

---
*Desarrollado para transformar cómo los emprendedores gestionan su libertad.*
