"""
CycloneNet Web Application — Deployment Entrypoint
Compatible with Hugging Face Spaces (Port 7860), Render, Railway, Docker, and local execution.
"""

import os
import uvicorn
from backend.app import app

# Hugging Face Spaces sets port 7860 by default; local defaults to 8000
PORT = int(os.environ.get("PORT", 7860))

if __name__ == "__main__":
    print(f"🌀 Starting CycloneNet on http://0.0.0.0:{PORT} ...")
    uvicorn.run("app:app", host="0.0.0.0", port=PORT)
