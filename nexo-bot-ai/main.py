from app.main import app
import os

if __name__ == "__main__":
    import uvicorn
    from app.db import init_db
    # Aseguramos que las tablas existan antes de que el tráfico llegue
    print(">>> [LAUNCH] Verificando tablas de base de datos...")
    try:
        init_db()
    except Exception as e:
        print(f">>> [LAUNCH] Error inicializando DB (pero seguimos): {e}")
        
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
