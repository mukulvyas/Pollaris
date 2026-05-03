# Stage 1: Build the React (Vite) frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source
COPY frontend/ .

# Build-time arguments for Vite (Must be declared here to be used in RUN npm run build)
ARG VITE_GOOGLE_MAPS_KEY
ARG VITE_GOOGLE_ANALYTICS_ID
ARG VITE_FIREBASE_API_KEY

ENV VITE_GOOGLE_MAPS_KEY=$VITE_GOOGLE_MAPS_KEY
ENV VITE_GOOGLE_ANALYTICS_ID=$VITE_GOOGLE_ANALYTICS_ID
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY

# Build the production bundle
RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Python backend + serve the built frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir --upgrade pip

# Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir aiofiles

# Backend source (copied flat into /app so imports work natively)
COPY backend/ .

# Frontend build output → /app/static
COPY --from=frontend-build /app/frontend/dist ./static

EXPOSE 8080

CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT}"]
