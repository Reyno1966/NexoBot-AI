import asyncio
import sys
import os

# Añadir el directorio actual al path para poder importar app
sys.path.append(os.getcwd())

from app.services.notification_service import NotificationService
from app.core.config import settings

async def test_real_email():
    print("🧪 Iniciando prueba de envío de email real...")
    
    # Configurar temporalmente las credenciales para la prueba
    # Nota: En producción esto vendría del .env o de las variables de entorno de Vercel/Render
    settings.SMTP_USER = "younailssalento@gmail.com"
    settings.SMTP_PASSWORD = "glgqcmidowejgwem" # Limpiamos los espacios
    
    tenant_name = "NexoBot AI Demo"
    tenant_phone = "+123456789"
    tenant_email = "younailssalento@gmail.com"
    customer_name = "Cliente de Prueba"
    
    print(f"📧 Enviando correo de prueba a {tenant_email}...")
    
    try:
        # Probamos una notificación de cita que es la más completa
        NotificationService.notify_appointment(
            tenant_name=tenant_name,
            tenant_phone=tenant_phone,
            tenant_email=tenant_email,
            customer_name=customer_name,
            details={
                "servicios": "Demostración del Asistente",
                "total": "0.00"
            }
        )
        print("\n✅ ¡Procedimiento de envío completado!")
        print("📥 Por favor, revisa tu bandeja de entrada (y la carpeta de Spam por si acaso).")
        print("Si el correo llegó, significa que NexoBot ya tiene 'voz' para avisarte de todo.")
        
    except Exception as e:
        print(f"\n❌ Error al enviar el correo: {e}")

if __name__ == "__main__":
    asyncio.run(test_real_email())
