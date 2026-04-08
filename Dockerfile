FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:22-slim
WORKDIR /app

# Python runtime for RL inference
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Install Python dependencies
RUN pip3 install --no-cache-dir --break-system-packages numpy gymnasium stable-baselines3 openai

# Copy backend server and runtime files
COPY backend/server.js ./server.js
COPY inference.py ./inference.py
COPY train.py ./train.py
COPY env ./env

# Copy built frontend into /app/dist (served by Express)
COPY --from=frontend-builder /app/frontend/dist ./dist

ENV NODE_ENV=production
ENV PORT=7860
ENV PYTHONUNBUFFERED=1
ENV DOCKER_ENV=1

EXPOSE 7860

CMD ["node", "server.js"]
