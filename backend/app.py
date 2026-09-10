"""
CycloneNet Web Application — FastAPI Backend
Serves the trained model and static frontend files.

Run with: uvicorn app:app --reload --port 8000
"""

import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
try:
    from model import CyclonePredictor
except ImportError:
    from backend.model import CyclonePredictor

# ── Initialize App ────────────────────────────────────────────────────────────

app = FastAPI(
    title="CycloneNet — Tropical Cyclone Detection & Classification",
    description="AI/ML system for identification and classification of tropical cyclones from satellite IR imagery",
    version="2.0"
)

# Allow frontend to call API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Model ────────────────────────────────────────────────────────────────

MODEL_NAME = "trained cyclone model.pth" if os.path.exists(os.path.join(os.path.dirname(__file__), "trained cyclone model.pth")) else "cyclone_model_v2_bundle.pth"
MODEL_PATH = os.path.join(os.path.dirname(__file__), MODEL_NAME)

if not os.path.exists(MODEL_PATH):
    print(f"WARNING: Model file not found at {MODEL_PATH}")
    print("Please copy trained cyclone model.pth to the backend/ directory.")
    predictor = None
else:
    print(f"Loading weights from: {MODEL_NAME}")
    predictor = CyclonePredictor(MODEL_PATH)

# ── Serve Frontend ────────────────────────────────────────────────────────────

ALT_FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "alt_frontend")


@app.get("/")
async def serve_homepage():
    """Serve the main HTML page (alt_frontend)."""
    return FileResponse(os.path.join(ALT_FRONTEND_DIR, "index.html"))


@app.get("/alt")
async def serve_alt_homepage():
    """Serve the alternate HTML page."""
    return FileResponse(os.path.join(ALT_FRONTEND_DIR, "index.html"))


# Mount static files (support both /static and /alt_static paths)
app.mount("/static", StaticFiles(directory=ALT_FRONTEND_DIR), name="static")
app.mount("/alt_static", StaticFiles(directory=ALT_FRONTEND_DIR), name="alt_static")

# ── API Endpoints ─────────────────────────────────────────────────────────────

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
MAX_FILE_SIZE_MB = 10


@app.post("/predict")
async def predict_cyclone(file: UploadFile = File(...)):
    """
    Upload a satellite IR image and get cyclone classification results.

    Returns:
    - is_cyclone: whether a cyclonic system is detected
    - class_name: intensity category (Low / Moderate / Intense)
    - wind_speed_kt: predicted wind speed in knots
    - wind_speed_kmh: predicted wind speed in km/h
    - confidence: prediction confidence (%)
    - severity_level: detailed IMD severity description
    - all_probabilities: probability for each class
    """
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please ensure cyclone_model_v2_bundle.pth is in the backend/ directory."
        )

    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded or filename is missing.")

    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file_extension}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file
    image_bytes = await file.read()

    # Validate file size
    file_size_mb = len(image_bytes) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({file_size_mb:.1f} MB). Maximum: {MAX_FILE_SIZE_MB} MB"
        )

    # Run prediction
    try:
        result = predictor.predict(image_bytes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(error)}")

    return JSONResponse(content=result)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": predictor is not None,
        "device": str(predictor.device) if predictor else "N/A"
    }


# ── Run directly ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)








