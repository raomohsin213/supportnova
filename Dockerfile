# =========================================================================
# SupportNova AI Governance Platform - Multi-Stage Production Dockerfile
# Optimized for Railway, Render, Fly.io, and Cloud Container Deployments
# =========================================================================

# -------------------------------------------------------------------------
# Stage 1: Frontend Build (Node.js 20)
# -------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies with caching
COPY frontend/package*.json ./
RUN npm ci || npm install

# Build static React + Vite application
COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------------------
# Stage 2: Production Python Backend Runtime
# -------------------------------------------------------------------------
FROM python:3.11-slim AS runner

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    PORT=8000

WORKDIR /app

# Install system utilities required for PDF processing and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install backend Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code, database, and seeds
COPY backend/ ./backend/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure upload, chroma, and db directories have write permissions for any container user
RUN mkdir -p /app/backend/uploads/policies /app/backend/chroma_db && \
    chmod -R 777 /app

# Expose ports (7860 for Hugging Face Spaces, 10000 for Render, 8000 default)
EXPOSE 7860
EXPOSE 8000
EXPOSE 10000

# Health check against FastAPI health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Launch production server on dynamic $PORT (Railway, Render, HuggingFace)
WORKDIR /app/backend
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
