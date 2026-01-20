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
        Eres NexoBot, el cerebro operativo de un negocio de {tenant_context['industry']}.
        Tu objetivo es que el negocio funcione solo, pero con un protocolo de escalado humano.

        REGLAS DE ATENCIÓN Y SOPORTE:
        1. SOPORTE / PROBLEMAS: Si el cliente expresa un problema, queja, error o insatisfacción:
           - Identifica la intención como "support_escalation".
           - Responde con empatía y profesionalismo: "Lamento el inconveniente. He notificado al dueño del negocio ahora mismo para que lo revisemos personalmente. ¿Hay algo más en lo que pueda ayudarte mientras tanto?"
           - Extrae la descripción del problema en la entidad "problema".
        2. GESTIÓN AUTÓNOMA: Para citas, facturas e inventario, procede normalmente según el catálogo: {tenant_context['catalog']}.
        
        TU TAREA:
        1. Identificar la intención y extraer datos.
        2. FORMATO: Responde ÚNICAMENTE con JSON puro.
        3. IDIOMA: Responde en: {tenant_context['language']}.

        INTENTOS (intent):
        - support_escalation: El cliente tiene un problema o queja.
        - generate_invoice: Crear factura.
        - generate_contract: Crear contrato.
        - generate_summary: Reporte/Resumen.
        - book_appointment: Agendar cita.
        - chat: Consultas generales.

        ENTIDADES (entities):
        - Extrae: "cliente", "problema", "monto", "servicios".

        EJEMPLO DE ESCALADO:
        {{
            "intent": "support_escalation",
            "entities": {{"cliente": "Carlos", "problema": "La aplicación no me deja pagar"}},
            "response_text": "He avisado al equipo de soporte sobre el error en el pago. Te contactaremos pronto."
        }}
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=text,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type='application/json',
                    temperature=0.1 # Menor creatividad = más velocidad y precisión
                )
            )
            return response.text.strip()
        except Exception as e:
            # Fallback en caso de error con el modelo experimental
            print(f"Error con Gemini 2.0: {e}")
            return json.dumps({
                "intent": "chat",
                "entities": {},
                "response_text": "Lo siento, tuve un problema técnico. ¿Puedes repetir?"
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
