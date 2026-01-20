import sys
import os
import json

# Añadir el directorio actual al path
sys.path.append(os.getcwd())

from app.services.notification_service import NotificationService

def test_low_stock_notification():
    print("Probando alerta de stock bajo...")
    tenant_name = "Barbería Pro"
    tenant_phone = "+123456789"
    tenant_email = "admin@barberia.com"
    item_name = "Cera Mate Premium"
    remaining_stock = 3
    
    try:
        # Probamos la notificación directamente
        success = NotificationService.notify_low_stock(
            tenant_name=tenant_name,
            tenant_phone=tenant_phone,
            tenant_email=tenant_email,
            item_name=item_name,
            remaining_stock=remaining_stock
        )
        print(f"✅ Notificación enviada (simulada): {success}")
        print("Revisa la terminal arriba para ver el mensaje formateado.")
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")

if __name__ == "__main__":
    test_low_stock_notification()
