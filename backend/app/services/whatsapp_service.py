import requests
import logging
from typing import Optional, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

class WhatsAppService:
    BASE_URL = settings.WHATSAPP_EVOLUTION_URL
    API_KEY = settings.WHATSAPP_EVOLUTION_API_KEY

    @classmethod
    def create_instance(cls, instance_name: str) -> Optional[Dict]:
        """
        Crea una nueva instancia en Evolution API para un tenant.
        """
        if not cls.BASE_URL or not cls.API_KEY:
            logger.error("WhatsApp Evolution URL o API Key no configurada")
            return None

        url = f"{cls.BASE_URL}/instance/create"
        headers = {"apikey": cls.API_KEY, "Content-Type": "application/json"}
        payload = {
            "instanceName": instance_name,
            "token": None,
            "qrcode": True
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                return response.json()
            logger.error(f"Error creando instancia: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Excepción en create_instance: {str(e)}")
            return None

    @classmethod
    def get_qr_code(cls, instance_name: str) -> Optional[str]:
        """
        Obtiene el código QR en base64 para vincular la instancia.
        """
        url = f"{cls.BASE_URL}/instance/connect/{instance_name}"
        headers = {"apikey": cls.API_KEY}

        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return data.get("base64") # Evolution API devuelve el QR en base64
            logger.error(f"Error obteniendo QR: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Excepción en get_qr_code: {str(e)}")
            return None

    @classmethod
    def get_status(cls, instance_name: str) -> str:
        """
        Verifica el estado de conexión de la instancia.
        """
        url = f"{cls.BASE_URL}/instance/connectionStatus/{instance_name}"
        headers = {"apikey": cls.API_KEY}

        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return data.get("instance", {}).get("state", "DISCONNECTED")
            return "DISCONNECTED"
        except Exception:
            return "ERROR"

    @classmethod
    def send_text(cls, instance_name: str, number: str, text: str) -> bool:
        """
        Envía un mensaje de texto a través de una instancia específica.
        """
        url = f"{cls.BASE_URL}/message/sendText/{instance_name}"
        headers = {"apikey": cls.API_KEY, "Content-Type": "application/json"}
        
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
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                return True
            logger.error(f"Error enviando mensaje: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            logger.error(f"Excepción en send_text: {str(e)}")
            return False

    @classmethod
    def logout(cls, instance_name: str) -> bool:
        """
        Desvincula y cierra la sesión de WhatsApp.
        """
        url = f"{cls.BASE_URL}/instance/logout/{instance_name}"
        headers = {"apikey": cls.API_KEY}

        try:
            response = requests.delete(url, headers=headers)
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
            response = requests.delete(url, headers=headers)
            return response.status_code == 200
        except Exception:
            return False
