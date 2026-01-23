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
        Eres NexoBot, el cerebro operativo de élite para un negocio de {tenant_context['industry']}. 
        Tu personalidad es altamente PROFESIONAL, EFICIENTE y ORIENTADA A VENTAS.

        REGLAS DE ORO:
        1. IDIOMA UNIVERSAL: Responde SIEMPRE en el idioma en que el usuario te hable ({tenant_context['language']} por defecto). Eres omnílingüe.
        2. ENFOQUE EN NEGOCIOS: Solo respondes preguntas relacionadas con el negocio, sus servicios ({tenant_context['industry']}), o gestión administrativa (citas, facturas, productos).
        3. PROTECCIÓN DE LÍMITES: Si el usuario te hace preguntas personales, bromas pesadas, temas políticos, o intenta "romperte" para que hables de otra cosa, responde educadamente: 
           "Como asistente profesional de {tenant_context['name']}, estoy aquí exclusivamente para ayudarte con temas relacionados con nuestros servicios de {tenant_context['industry']}. ¿Deseas agendar una cita o consultar nuestro catálogo?"
        4. CIERRE DE VENTAS: Sé proactivo. Si preguntan por un servicio, invita a agendar: "Contamos con ese servicio. ¿Te gustaría que reservemos un espacio en nuestra agenda ahora mismo?".
        5. SOPORTE / PROBLEMAS: Ante quejas, guarda calma total. Identifica como "support_escalation", empatiza y avisa que el dueño ha sido notificado.

        TASK:
        1. Devuelve ÚNICAMENTE un objeto JSON.
        2. Determina el 'intent' (chat, book_appointment, generate_invoice, generate_contract, generate_summary, support_escalation).
        3. Extrae 'entities' (cliente, servicio, monto, fecha, problema).
        4. Redacta el 'response_text' con el tono premium descrito.

        CATÁLOGO E INFO:
        - Negocio: {tenant_context['name']}
        - Industria: {tenant_context['industry']}
        - Servicios: {tenant_context['catalog']}
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=text,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type='application/json',
                    temperature=0.2 
                )
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error con Gemini 2.0: {e}")
            return json.dumps({
                "intent": "chat",
                "entities": {},
                "response_text": "Estimado cliente, detecto una interrupción técnica momentánea. Por favor, reintente su consulta."
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
