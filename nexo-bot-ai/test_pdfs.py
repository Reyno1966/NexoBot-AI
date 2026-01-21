import sys
import os

# Añadir el directorio actual al path para poder importar
sys.path.append(os.getcwd())

from app.services.ai_service import AIService
from app.core.config import settings

def test_pdf_generation():
    print("Probando generación de PDFs...")
    
    # Mock data
    data = {
        "cliente": "Cliente de Prueba",
        "monto": "150.00",
        "propiedad": "Villa Mar",
        "servicios": "Consultoria Digital",
        "total": "150.00",
        "noches": "3"
    }
    tenant_name = "NexoBot Test Business"
    
    try:
        # 1. Test Contrato
        contract = AIService.generate_contract_pdf(data, tenant_name)
        print(f"✅ Contrato generado: {contract}")
        
        # 2. Test Factura
        invoice = AIService.generate_invoice_pdf(data, tenant_name)
        print(f"✅ Factura generada: {invoice}")
        
        # 3. Test Memoria
        summary = AIService.generate_summary_pdf(data, tenant_name)
        print(f"✅ Memoria generada: {summary}")
        
        # Verificar que existen en la carpeta static
        files = os.listdir("static")
        print(f"\nArchivos en 'static/': {files}")
        
    except Exception as e:
        print(f"❌ Error durante la generación: {e}")

if __name__ == "__main__":
    # Asegurarse de que existe la carpeta static
    os.makedirs("static", exist_ok=True)
    test_pdf_generation()
