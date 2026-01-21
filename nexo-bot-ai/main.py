from app.main import app
import os

if __name__ == "__main__":
    import uvicorn
    # Le decimos que use el puerto que Render nos dé, o 8000 por defecto
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
