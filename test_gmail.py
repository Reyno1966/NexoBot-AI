import smtplib
from email.mime.text import MIMEText

# Datos de tu .env
user = "younailssalento@gmail.com"
password = "glgqcmidowejgwem"
host = "smtp.gmail.com"
port = 587

print(f"DEBUG: Intentando conectar a {host}:{port} con {user}...")

try:
    server = smtplib.SMTP(host, port)
    server.starttls()
    server.login(user, password)
    print("✅ EXITO: Las credenciales de Gmail son CORRECTAS.")
    
    # Enviar un correo de prueba a ti mismo
    msg = MIMEText("Prueba de conexion de NexoBot")
    msg['Subject'] = "NexoBot Test"
    msg['From'] = user
    msg['To'] = user
    server.send_message(msg)
    print(f"📧 Mensaje de prueba enviado a {user}")
    
    server.quit()
except Exception as e:
    print(f"❌ ERROR: Fallo la conexion. Detalles: {str(e)}")
    print("\nPOSIBLES CAUSAS:")
    print("1. El 'Password' no es el de tu correo, sino que falta generar una 'App Password' en Google.")
    print("2. Tienes activada la seguridad de 2 pasos y no usas App Password.")
    print("3. Google esta bloqueando el acceso desde este servidor.")
