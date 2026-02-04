import requests
import logging
from typing import Optional, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

class WhatsAppService:
    BASE_URL = settings.WHATSAPP_EVOLUTION_URL
    API_KEY = settings.WHATSAPP_EVOLUTION_API_KEY

    @classmethod
    def create_instance(cls, instance_name: str, api_key: Optional[str] = None) -> Optional[Dict]:
        """
        Crea una nueva instancia en Evolution API para un tenant.
        """
        key = api_key or cls.API_KEY
        if not cls.BASE_URL or not key:
            print(">>> [WHATSAPP] ERROR: URL o API Key no configurada")
            return None

        url = f"{cls.BASE_URL}/instance/create"
        headers = {"apikey": key, "Content-Type": "application/json"}
        payload = {
            "instanceName": instance_name,
            "token": None,
            "qrcode": True
        }

        try:
            print(f">>> [WHATSAPP] Intentando crear instancia: {instance_name} en {url}")
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            if response.status_code in [200, 201]:
                return response.json()
            print(f">>> [WHATSAPP] Error en create: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            print(f">>> [WHATSAPP] Excepción en create_instance: {str(e)}")
            return None

    @classmethod
    def get_pairing_code(cls, instance_name: str, number: str, api_key: Optional[str] = None) -> Optional[str]:
        """
        Obtiene un código de emparejamiento para vincular la instancia por número de teléfono.
        """
        key = api_key or cls.API_KEY
        url = f"{cls.BASE_URL}/instance/connect/pairing/{instance_name}"
        headers = {"apikey": key}
        
        # Limpiar el número
        clean_number = "".join(filter(str.isdigit, number))
        
        params = {"number": clean_number}

        try:
            print(f">>> [WHATSAPP] Solicitando Pairing Code para: {clean_number} en {url}")
            response = requests.get(url, headers=headers, params=params, timeout=15)
            if response.status_code == 200:
                data = response.json()
                return data.get("code") or data.get("pairingCode")
            print(f">>> [WHATSAPP] Error en get_pairing_code: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            print(f">>> [WHATSAPP] Excepción en get_pairing_code: {str(e)}")
            return None

    @classmethod
    def get_qr_code(cls, instance_name: str, api_key: Optional[str] = None) -> Optional[str]:
        """
        Obtiene el código QR en base64 para vincular la instancia.
        """
        key = api_key or cls.API_KEY
        url = f"{cls.BASE_URL}/instance/connect/{instance_name}"
        headers = {"apikey": key}

        try:
            print(f">>> [WHATSAPP] Solicitando QR para: {instance_name} en {url}")
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                return data.get("base64")
            print(f">>> [WHATSAPP] Error en get_qr: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            print(f">>> [WHATSAPP] Excepción en get_qr_code: {str(e)}")
            return None

    @classmethod
    def get_status(cls, instance_name: str, api_key: Optional[str] = None) -> str:
        """
        Verifica el estado de conexión de la instancia.
        """
        key = api_key or cls.API_KEY
        url = f"{cls.BASE_URL}/instance/connectionStatus/{instance_name}"
        headers = {"apikey": key}

        try:
            print(f">>> [WHATSAPP] Verificando status de: {instance_name}")
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                state = data.get("instance", {}).get("state", "DISCONNECTED")
                print(f">>> [WHATSAPP] Estado actual: {state}")
                return state
            return "DISCONNECTED"
        except Exception as e:
            print(f">>> [WHATSAPP] Error verificando status: {str(e)}")
            return "ERROR"

    @classmethod
    def send_text(cls, instance_name: str, number: str, text: str, api_key: Optional[str] = None) -> bool:
        """
        Envía un mensaje de texto a través de una instancia específica.
        """
        key = api_key or cls.API_KEY
        url = f"{cls.BASE_URL}/message/sendText/{instance_name}"
        headers = {"apikey": key, "Content-Type": "application/json"}
        
        # Limpiar el número (quitar +, espacios, etc)
        clean_number = "".join(filter(str.isdigit, number))
        
        payload = {
            "number": clean_number,
            "options": {
                "delay": 1200,
                "presence": "composing",
                "linkPreview": True
            },
            "textMessage": {
                "text": text
            }
        }

        try:
            print(f">>> [WHATSAPP] Enviando mensaje a {clean_number} via {instance_name}")
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            print(f">>> [WHATSAPP] Respuesta Servidor ({response.status_code}): {response.text}")
            if response.status_code in [200, 201]:
                return True
            return False
        except Exception as e:
            print(f">>> [WHATSAPP] Excepción enviando mensaje: {str(e)}")
            return False

    @classmethod
    def logout(cls, instance_name: str) -> bool:
        """
        Desvincula y cierra la sesión de WhatsApp.
        """
        url = f"{cls.BASE_URL}/instance/logout/{instance_name}"
        headers = {"apikey": cls.API_KEY}

        try:
            response = requests.delete(url, headers=headers, timeout=15)
            return response.status_code == 200
        except Exception:
            return False

    @classmethod
    def delete_instance(cls, instance_name: str) -> bool:
        """
        Elimina la instancia por completo.
        """
        url = f"{cls.BASE_URL}/instance/delete/{instance_name}"
        headers = {"apikey": cls.API_KEY}

        try:
            response = requests.delete(url, headers=headers, timeout=15)
            return response.status_code == 200
        except Exception:
            return False
