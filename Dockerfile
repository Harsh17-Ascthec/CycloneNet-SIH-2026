# ── CycloneNet Deployment Container (Hugging Face Spaces / Docker) ────────────
FROM python:3.10-slim

# Prevent Python from writing .pyc and enable immediate log flushing
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system runtime dependencies for OpenCV and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requires running as non-root user with UID 1000
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install Python dependencies (install CPU-only PyTorch to minimize image size & build time)
COPY --chown=user requirements.txt $HOME/app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code and weights
COPY --chown=user . $HOME/app

# Expose standard Hugging Face Spaces web port
EXPOSE 7860

# Launch FastAPI web application with Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
