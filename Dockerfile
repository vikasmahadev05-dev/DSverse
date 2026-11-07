# ==============================================================================
# DSVERSE - Production Multi-Stage Dockerfile
# Builds React Frontend and bundles with FastAPI + GCC 16 C Compiler Sandbox
# ==============================================================================

# -------------------------------------------------------------
# Stage 1: Build Frontend Assets
# -------------------------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Runtime with Native GCC C11 Compiler
# -------------------------------------------------------------
FROM python:3.11-slim AS runner

# Install GCC, build-essential and standard C development libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    libc6-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY . ./

# Copy pre-compiled frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure uploads directory exists for PDF processing
RUN mkdir -p /app/uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

# Start DSVERSE production server
CMD ["python", "server.py"]

