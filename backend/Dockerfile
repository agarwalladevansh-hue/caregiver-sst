# Backend Dockerfile - Node.js Express with Python inference support
# Using Debian (slim) instead of Alpine for better Python/C extension support

FROM node:22-slim

# Install base system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    wget \
    bash \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install Node dependencies
RUN npm install --production

# Install Python dependencies for inference
RUN pip3 install --no-cache-dir --break-system-packages numpy gymnasium stable-baselines3

# Copy backend server
COPY backend/server.js ./

# Create directories for optional files
RUN mkdir -p /app/env

# Copy Python files that exist in the root
COPY inference.py ./
COPY train.py ./
COPY carematch_ppo.zip ./
COPY env ./env

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
