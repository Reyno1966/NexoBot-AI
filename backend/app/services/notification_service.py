from typing import Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class NotificationService:
    @staticmethod
    def send_whatsapp_alert(phone: str, message: str):
        """
        Simulación de envío de alerta por WhatsApp/SMS.
        """
        print(f"🚀 [NOTIFICACIÓN WHATSAPP] Enviando a {phone}: {message}")
        return True

    @staticmethod
    def send_email_alert(to_email: str, subject: str, message_html: str):
        """
        Envío de correo real usando Gmail/SMTP.
        """
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            print(f"📧 [AVISO EMAIL] No configurado. Simulación para {to_email}: {subject}")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.SMTP_USER}>"
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(message_html, 'html'))

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            print(f"📧 [EMAIL] Enviado con éxito a {to_email}")
            return True
        except Exception as e:
            print(f"❌ [EMAIL ERROR] {str(e)}")
            return False

    @staticmethod
    def notify_appointment(tenant_name: str, tenant_phone: str, tenant_email: str, customer_name: str, details: Dict):
        """
        Envía un aviso de nueva cita (WhatsApp + Email).
        """
        text_msg = f"🌟 *NEXOBOT* | Nueva Cita Agendada\n\n🏢 *Negocio*: {tenant_name}\n👤 *Cliente*: {customer_name}\n🛠️ *Servicio*: {details.get('servicios', 'Gestión de cita')}\n💰 *Monto*: ${details.get('total', 'A confirmar')}"
        
        # WhatsApp
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg)
        
        # Email HTML Premium
        html_msg = f"""
        <div style="font-family: sans-serif; background: #0f1115; color: white; padding: 40px; border-radius: 20px;">
            <h2 style="color: #2db5b9;">🌟 Nueva Cita Agendada</h2>
            <p>Tu asistente <b>NexoBot AI</b> ha registrado una nueva actividad:</p>
            <hr style="border: 0; border-top: 1px solid #1a1f24; margin: 20px 0;">
            <p><b>Negocio:</b> {tenant_name}</p>
            <p><b>Cliente:</b> {customer_name}</p>
            <p><b>Servicio:</b> {details.get('servicios', 'Gestión de cita')}</p>
            <p><b>Monto Estimado:</b> ${details.get('total', 'A confirmar')}</p>
            <br>
            <p style="font-size: 12px; color: #64748b;">Este es un mensaje automático del cerebro operativo de NexoBot AI.</p>
        </div>
        """
        if tenant_email:
            NotificationService.send_email_alert(tenant_email, f"🌟 NexoBot: Nueva Cita de {customer_name}", html_msg)

    @staticmethod
    def notify_request(tenant_name: str, tenant_phone: str, tenant_email: str, customer_name: str, request_type: str):
        """
        Envía un aviso de solicitud de documento (WhatsApp + Email).
        """
        text_msg = f"📥 *NEXOBOT* | Solicitud de {request_type}\n\n👤 *Solicitante*: {customer_name}\n🏢 *Negocio*: {tenant_name}"
        
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg)
        
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
            NotificationService.send_email_alert(tenant_email, f"📥 NexoBot: Nuevo {request_type} generado", html_msg)

    @staticmethod
    def notify_low_stock(tenant_name: str, tenant_phone: str, tenant_email: str, item_name: str, remaining_stock: int):
        """
        Envía alerta de stock bajo (WhatsApp + Email).
        """
        text_msg = f"⚠️ *NEXOBOT* | Inventario Bajo\n\n📦 *Producto*: {item_name}\n📉 *Stock*: {remaining_stock} unidades"
        
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg)
        
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
            NotificationService.send_email_alert(tenant_email, f"⚠️ ALERTA: Stock Bajo en {item_name}", html_msg)

    @staticmethod
    def notify_support_issue(tenant_name: str, tenant_phone: str, tenant_email: str, customer_name: str, issue_description: str):
        """
        Envía una alerta de EMERGENCIA cuando un cliente tiene un problema.
        """
        text_msg = f"🆘 *NEXOBOT EMERGENCIA* | Problema de Cliente\n\n👤 *Cliente*: {customer_name}\n🚨 *Problema*: {issue_description}\n\n👉 _Atiende esto personalmente para evitar una mala reseña._"
        
        NotificationService.send_whatsapp_alert(tenant_phone, text_msg)
        
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
            NotificationService.send_email_alert(tenant_email, f"🚨 EMERGENCIA: Problema de Cliente en {tenant_name}", html_msg)
