from typing import Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.services.whatsapp_service import WhatsAppService

class NotificationService:
    @staticmethod
    def send_whatsapp_alert(phone: str, message: str, whatsapp_config: Dict = None):
        """
        Envía alerta por WhatsApp con fallback a la configuración global y maestra.
        """
        if not phone or not message or len(str(phone)) < 5 or phone == "No configurado":
            print(f"⚠️ [WHATSAPP OMITIDO] Número inválido o no configurado: {phone}")
            return False

        # Prioridad 1: Instancia propia del Tenant
        instance_id = (whatsapp_config or {}).get('instance_id')
        api_key = (whatsapp_config or {}).get('api_key') or getattr(settings, 'WHATSAPP_EVOLUTION_API_KEY', None)
        
        if instance_id and api_key:
            print(f"📡 [WHATSAPP REAL] Enviando via instancia propia {instance_id} a {phone}")
            return WhatsAppService.send_text(instance_id, phone, message, api_key=api_key)
            
        # Prioridad 2: Instancia Maestra (NexoBot Central) si no hay instancia propia
        master_instance = getattr(settings, 'WHATSAPP_MASTER_INSTANCE', None)
        if master_instance and api_key:
            print(f"🚀 [WHATSAPP MASTER] Enviando via NexoBot Central a {phone}")
            # Añadimos un pequeño prefijo para que el dueño sepa que es vía NexoBot
            master_msg = f"🔔 *Aviso NexoBot*\n\n{message}"
            return WhatsAppService.send_text(master_instance, phone, master_msg, api_key=api_key)

        print(f"⚠️ [WHATSAPP FALLIDO] Sin configuración para {phone}: {message}")
        return False

    @staticmethod
    def notify_customer_booking(customer_phone: str, customer_name: str, business_name: str, date_str: str, service_name: str, whatsapp_config: Dict = None):
        """
        Envía una confirmación directa al cliente por WhatsApp.
        """
        if not customer_phone:
            return False
            
        msg = f"✅ *¡Cita Confirmada!*\n\nHola {customer_name}, tu cita en *{business_name}* ha sido registrada con éxito.\n\n📅 *Fecha*: {date_str}\n🛠️ *Servicio*: {service_name}\n\n¡Te esperamos!"
        return NotificationService.send_whatsapp_alert(customer_phone, msg, whatsapp_config)

    @staticmethod
    def send_email_alert(to_email: str, subject: str, message_html: str, smtp_config: Dict = None):
        """
        Envío de correo real usando Resend (Prioridad), SMTP o simulador.
        """
        resend_key = (smtp_config or {}).get('resend_api_key')
        
        if resend_key:
            try:
                import requests
                response = requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": f"{settings.EMAILS_FROM_NAME} <onboarding@resend.dev>", # O dominio validado
                        "to": [to_email],
                        "subject": subject,
                        "html": message_html
                    }
                )
                if response.status_code == 200 or response.status_code == 201:
                    print(f"📧 [RESEND] Enviado con éxito a {to_email}")
                    return True
                else:
                    print(f"❌ [RESEND ERROR] Status {response.status_code}: {response.text}")
            except Exception as e:
                print(f"❌ [RESEND EXCEPTION] {str(e)}")

        host = (smtp_config or {}).get('host') or settings.SMTP_HOST
        port = (smtp_config or {}).get('port') or settings.SMTP_PORT
        user = (smtp_config or {}).get('user') or settings.SMTP_USER
        password = (smtp_config or {}).get('password') or settings.SMTP_PASSWORD

        if not user or not password:
            print(f"📧 [AVISO EMAIL] Credenciales incompletas para {to_email}. Usando simulador.")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = f"{settings.EMAILS_FROM_NAME} <{user}>"
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(message_html, 'html'))

            server = smtplib.SMTP(host, port)
            server.starttls()
            server.login(user, password)
            server.send_message(msg)
            server.quit()
            print(f"📧 [EMAIL] Enviado con éxito a {to_email} vía {host}")
            return True
        except Exception as e:
            print(f"❌ [EMAIL ERROR] {str(e)}")
            return False

    @staticmethod
    def notify_appointment(tenant_name: str, tenant_phone: str, tenant_email: str, customer_name: str, details: Dict, smtp_config: Dict = None, whatsapp_config: Dict = None):
        """
        Envía un aviso de nueva cita (WhatsApp + Email).
        """
        phone = details.get('telefono', 'No proporcionado')
        address = details.get('direccion', 'No proporcionada')
        
        text_msg = f"🌟 *NEXOBOT* | Nueva Cita Agendada\n\n🏢 *Negocio*: {tenant_name}\n👤 *Cliente*: {customer_name}\n📞 *Teléfono*: {phone}\n📍 *Dirección*: {address}\n🛠️ *Servicio*: {details.get('servicios', details.get('propiedad', 'Gestión de cita'))}\n💰 *Monto*: ${details.get('total', details.get('monto', 'A confirmar'))}"
        
        # WhatsApp
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg, whatsapp_config)
        
        # Email HTML Premium
        html_msg = f"""
        <div style="font-family: sans-serif; background: #0f1115; color: white; padding: 40px; border-radius: 20px;">
            <h2 style="color: #2db5b9;">🌟 Nueva Cita Agendada</h2>
            <p>Tu asistente <b>NexoBot AI</b> ha registrado una nueva actividad:</p>
            <hr style="border: 0; border-top: 1px solid #1a1f24; margin: 20px 0;">
            <p><b>Negocio:</b> {tenant_name}</p>
            <p><b>Cliente:</b> {customer_name}</p>
            <p><b>Teléfono:</b> {phone}</p>
            <p><b>Dirección:</b> {address}</p>
            <p><b>Servicio:</b> {details.get('servicios', details.get('propiedad', 'Gestión de cita'))}</p>
            <p><b>Monto Estimado:</b> ${details.get('total', details.get('monto', 'A confirmar'))}</p>
            <br>
            <p style="font-size: 12px; color: #64748b;">Este es un mensaje automático del cerebro operativo de NexoBot AI.</p>
        </div>
        """
        if tenant_email:
            NotificationService.send_email_alert(tenant_email, f"🌟 NexoBot: Nueva Cita de {customer_name}", html_msg, smtp_config)

    @staticmethod
    def notify_request(tenant_name: str, tenant_phone: str, tenant_email: str, customer_name: str, request_type: str, smtp_config: Dict = None, whatsapp_config: Dict = None):
        """
        Envía un aviso de solicitud de documento (WhatsApp + Email).
        """
        text_msg = f"📥 *NEXOBOT* | Solicitud de {request_type}\n\n👤 *Solicitante*: {customer_name}\n🏢 *Negocio*: {tenant_name}"
        
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg, whatsapp_config)
        
        html_msg = f"""
        <div style="font-family: sans-serif; background: #0f1115; color: white; padding: 40px; border-radius: 20px;">
            <h2 style="color: #f5b045;">📥 Solicitud de Documento</h2>
            <p>Se ha generado un <b>{request_type}</b> para un cliente:</p>
            <hr style="border: 0; border-top: 1px solid #1a1f24; margin: 20px 0;">
            <p><b>Cliente:</b> {customer_name}</p>
            <p><b>Tipo:</b> {request_type}</p>
            <p><b>Negocio:</b> {tenant_name}</p>
            <br>
            <p style="font-size: 12px; color: #64748b;">El documento ha sido entregado automáticamente via chat.</p>
        </div>
        """
        if tenant_email:
            NotificationService.send_email_alert(tenant_email, f"📥 NexoBot: Nuevo {request_type} generado", html_msg, smtp_config)

    @staticmethod
    def notify_low_stock(tenant_name: str, tenant_phone: str, tenant_email: str, item_name: str, remaining_stock: int, smtp_config: Dict = None, whatsapp_config: Dict = None):
        """
        Envía alerta de stock bajo (WhatsApp + Email).
        """
        text_msg = f"⚠️ *NEXOBOT* | Inventario Bajo\n\n📦 *Producto*: {item_name}\n📉 *Stock*: {remaining_stock} unidades"
        
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg, whatsapp_config)
        
        html_msg = f"""
        <div style="font-family: sans-serif; background: #0f1115; color: white; padding: 40px; border-radius: 20px; border: 1px solid #ef4444;">
            <h2 style="color: #ef4444;">⚠️ Alerta de Inventario</h2>
            <p>Atención, un producto de <b>{tenant_name}</b> se está agotando:</p>
            <hr style="border: 0; border-top: 1px solid #1a1f24; margin: 20px 0;">
            <p><b>Producto:</b> {item_name}</p>
            <p><b>Stock Restante:</b> <span style="color: #ef4444; font-weight: bold;">{remaining_stock} unidades</span></p>
            <br>
            <p>Te recomendamos reponer este item pronto para evitar pérdida de ventas.</p>
        </div>
        """
        if tenant_email:
            NotificationService.send_email_alert(tenant_email, f"⚠️ ALERTA: Stock Bajo en {item_name}", html_msg, smtp_config)

    @staticmethod
    def notify_support_issue(tenant_name: str, tenant_phone: str, tenant_email: str, customer_name: str, issue_description: str, smtp_config: Dict = None, whatsapp_config: Dict = None):
        """
        Envía una alerta de EMERGENCIA cuando un cliente tiene un problema.
        """
        text_msg = f"🆘 *NEXOBOT EMERGENCIA* | Problema de Cliente\n\n👤 *Cliente*: {customer_name}\n🚨 *Problema*: {issue_description}\n\n👉 _Atiende esto personalmente para evitar una mala reseña._"
        
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg, whatsapp_config)
        
        html_msg = f"""
        <div style="font-family: sans-serif; background: #450a0a; color: white; padding: 40px; border-radius: 20px; border: 2px solid #ef4444;">
            <h2 style="color: #ef4444;">🆘 EMERGENCIA: Problema con un Cliente</h2>
            <p>Un cliente ha reportado un problema que NexoBot no puede resolver solo:</p>
            <hr style="border: 0; border-top: 1px solid #7f1d1d; margin: 20px 0;">
            <p><b>Cliente:</b> {customer_name}</p>
            <p><b>Descripción del Problema:</b></p>
            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                {issue_description}
            </div>
            <p><b>Acción Recomendada:</b> Contacta al cliente lo antes posible.</p>
        </div>
        """
        if tenant_email:
            NotificationService.send_email_alert(tenant_email, f"🚨 EMERGENCIA: Problema de Cliente en {tenant_name}", html_msg, smtp_config)

    @staticmethod
    def notify_chat_message(tenant_name: str, tenant_phone: str, tenant_email: str, customer_name: str, message: str, smtp_config: Dict = None, whatsapp_config: Dict = None):
        """
        Alerta general cuando un cliente habla con el bot.
        """
        text_msg = f"💬 *NEXOBOT* | Nuevo mensaje de cliente\n\n👤 *Cliente*: {customer_name}\n📝 *Mensaje*: {message}\n\n🏢 *Negocio*: {tenant_name}"
        
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg, whatsapp_config)
        
        html_msg = f"""
        <div style="font-family: sans-serif; background: #0f1115; color: white; padding: 40px; border-radius: 20px;">
            <h2 style="color: #38bdf8;">💬 Nuevo Mensaje de Cliente</h2>
            <p>Un cliente está interactuando con tu asistente <b>NexoBot</b>:</p>
            <hr style="border: 0; border-top: 1px solid #1a1f24; margin: 20px 0;">
            <p><b>Cliente:</b> {customer_name}</p>
            <p><b>Mensaje:</b> {message}</p>
            <p><b>Negocio:</b> {tenant_name}</p>
            <br>
            <p style="font-size: 12px; color: #64748b;">NexoBot está respondiendo automáticamente, pero puedes intervenir si lo deseas.</p>
        </div>
        """
        if tenant_email:
            NotificationService.send_email_alert(tenant_email, f"💬 NexoBot: Nuevo mensaje de {customer_name}", html_msg, smtp_config)
