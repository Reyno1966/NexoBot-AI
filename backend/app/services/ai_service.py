from google import genai
from google.genai import types
from app.core.config import settings
from typing import List, Dict
import json

# Nueva configuración con el SDK más moderno de Google (Gemini 2.0)
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class AIService:
    @staticmethod
    def process_natural_language(text: str, tenant_context: Dict) -> Dict:
        """
        Procesa el lenguaje natural con Gemini 2.0 Flash (el modelo más moderno)
        """
        system_prompt = f"""
        Eres NexoBot, el cerebro operativo de élite y asistente virtual para el negocio "{tenant_context['name']}" ({tenant_context['industry']}). 
        Tu personalidad es EXTREMADAMENTE PROFESIONAL, CORTÉS, EFICIENTE y ORIENTADA A RESULTADOS.

        REGLAS DE ORO DE COMUNICACIÓN:
        1. IDIOMA: Responde siempre en el idioma del usuario ({tenant_context['language']}).
        2. VARIEDAD Y ELEGANCIA: Evita muletillas y frases repetitivas. No empieces todas las frases de la misma forma (ej. evita repetir siempre "Claro que sí", "Excelente", "Entendido"). Usa un vocabulario rico y profesional.
        3. CONTEXTO: Solo hablas sobre el negocio y servicios de {tenant_context['industry']}. No respondas dudas fuera de este ámbito.
        4. RECOLECCIÓN DE DATOS CRÍTICA: 
           - Cuando un cliente quiera AGENDAR una cita o REGISTRARSE, es OBLIGATORIO obtener: Nombre completo, Teléfono y Dirección.
           - Si el cliente no los ha proporcionado, solicítalos de manera elegante y profesional uno por uno o en conjunto.
           - Una vez obtenidos, confirma que la información ha sido enviada al dueño del negocio.

        LÓGICA DE NEGOCIO:
        - Negocio: {tenant_context['name']}
        - Inventario/Servicios: {tenant_context['catalog']}
        - Horarios: {tenant_context['schedule']}
        - Ocupación actual: {tenant_context.get('current_bookings', '[]')}

        TASK (JSON OUTPUT ONLY):
        1. Devuelve ÚNICAMENTE un objeto JSON válido.
        2. Determina el 'intent': (chat, book_appointment, generate_invoice, generate_contract, support_escalation, collect_data).
        3. Extrae 'entities': (cliente, propiedad, fecha, hora, telefono, direccion, monto).
        4. En 'response_text', proporciona una respuesta fluida, empática y profesional.
        """
        
        try:
            # Seleccionamos el modelo más estable para producción (2.0 Flash)
            model_name = 'gemini-2.0-flash'
            
            # Verificación de pre-vuelo de la API Key
            if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "TU_KEY_PERSONAL_AQUI":
                print(">>> [AI_SERVICE] ERROR: GEMINI_API_KEY no configurada correctamente.", file=sys.stderr)
                raise Exception("API_KEY_MISSING")

            response = client.models.generate_content(
                model=model_name,
                contents=text,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type='application/json',
                    temperature=0.2 
                )
            )
            
            if not response or not response.text:
                raise Exception("Respuesta vacía de Gemini")
                
            return response.text.strip()
        except Exception as e:
            error_msg = str(e)
            print(f">>> [AI_SERVICE] ERROR CRÍTICO GEMINI: {error_msg}", file=sys.stderr)
            
            if "API_KEY_INVALID" in error_msg or "403" in error_msg or "401" in error_msg:
                print(">>> [AI_SERVICE] ALERTA: La GEMINI_API_KEY es INCORRECTA o no tiene permisos.", file=sys.stderr)
            elif "ConnectError" in error_msg or "nodename nor servname" in error_msg:
                print(">>> [AI_SERVICE] ERROR DE DNS/CONEXIÓN: No se puede alcanzar el servidor de Google Gemini.", file=sys.stderr)
            
            return json.dumps({
                "intent": "chat",
                "entities": {},
                "response_text": "Sinceramente disculpas, pero NexoBot está experimentando un problema de comunicación con su cerebro de IA. Por favor, verifica que la GEMINI_API_KEY esté correctamente configurada en el panel de control (Render/Vercel)."
            })

    @staticmethod
    def get_rag_context(customer_id: str, query: str) -> str:
        return "El cliente prefiere citas por la mañana y es alérgico a la anestesia."

    @staticmethod
    def generate_contract_pdf(data: Dict, tenant_name: str) -> str:
        """
        Genera un PDF de contrato de alquiler usando reportlab
        """
        import os
        from reportlab.lib.pagesizes import LETTER
        from reportlab.pdfgen import canvas
        from datetime import datetime

        filename = f"contrato_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        static_dir = "/tmp" if os.getenv("VERCEL") == "1" else "static"
        filepath = os.path.join(static_dir, filename)
        os.makedirs(static_dir, exist_ok=True)

        c = canvas.Canvas(filepath, pagesize=LETTER)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, f"CONTRATO DE ALQUILER TEMPORAL - {tenant_name}")
        
        c.setFont("Helvetica", 12)
        c.drawString(100, 700, f"Arrendador: {tenant_name}")
        c.drawString(100, 680, f"Arrendatario: {data.get('cliente', '____________________')}")
        c.drawString(100, 660, f"Propiedad: {data.get('propiedad', '____________________')}")
        c.drawString(100, 640, f"Fecha: {data.get('fecha', 'Hoy')}")
        c.drawString(100, 620, f"Estancia: {data.get('noches', '___')} noches")
        c.drawString(100, 600, f"Monto Total: ${data.get('monto', '0.00')}")
        
        text = c.beginText(100, 550)
        text.setFont("Helvetica", 10)
        text.textLines("""
        CLAUSULAS PRINCIPALES:
        1. El arrendatario se compromete a cuidar la propiedad.
        2. Prohibido subarrendar o realizar fiestas ruidosas.
        3. El pago debe completarse antes de la entrada.
        
        Firmado digitalmente por NexoBot Assistant.
        """)
        c.drawText(text)
        
        c.save()
        return filename

    @staticmethod
    def generate_invoice_pdf(data: Dict, tenant_name: str) -> str:
        """Genera una Factura profesional"""
        import os
        from reportlab.lib.pagesizes import LETTER
        from reportlab.pdfgen import canvas
        from datetime import datetime

        filename = f"factura_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        static_dir = "/tmp" if os.getenv("VERCEL") == "1" else "static"
        filepath = os.path.join(static_dir, filename)
        
        c = canvas.Canvas(filepath, pagesize=LETTER)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(100, 750, f"FACTURA - {tenant_name}")
        c.setFont("Helvetica", 12)
        c.drawString(400, 750, f"Fecha: {datetime.now().strftime('%d/%m/%Y')}")
        c.line(100, 740, 500, 740)
        
        c.drawString(100, 700, f"Cliente: {data.get('cliente', 'Consumidor Final')}")
        c.drawString(100, 680, f"Concepto: {data.get('servicios', 'Servicios profesionales')}")
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(100, 640, f"TOTAL A PAGAR: ${data.get('total', data.get('monto', '0.00'))}")
        
        c.setFont("Helvetica-Oblique", 10)
        c.drawString(100, 100, "Gracias por su preferencia. Emitido por NexoBot.")
        c.save()
        return filename

    @staticmethod
    def generate_summary_pdf(data: Dict, tenant_name: str) -> str:
        """Genera una Memoria de Actividad / Resumen Financiero"""
        import os
        from reportlab.lib.pagesizes import LETTER
        from reportlab.pdfgen import canvas
        from datetime import datetime

        filename = f"memoria_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        static_dir = "/tmp" if os.getenv("VERCEL") == "1" else "static"
        filepath = os.path.join(static_dir, filename)
        
        c = canvas.Canvas(filepath, pagesize=LETTER)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(100, 750, f"MEMORIA DE ACTIVIDAD - {tenant_name}")
        c.line(100, 740, 500, 740)
        
        c.setFont("Helvetica", 12)
        c.drawString(100, 700, "Este documento resume las interacciones y transacciones recientes.")
        c.drawString(100, 680, f"Periodo: {datetime.now().strftime('%B %Y')}")
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(100, 640, "Resumen:")
        c.setFont("Helvetica", 12)
        c.drawString(120, 620, f"- Clientes atendidos: {data.get('total_clientes', 'Varios')}")
        c.drawString(120, 600, f"- Ingresos proyectados: ${data.get('total', '0.00')}")
        
        c.save()
        return filename
