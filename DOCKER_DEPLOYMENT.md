# CareMatch RL - Docker Deployment Guide

## Overview

This guide explains how to deploy the CareMatch RL project using Docker and Docker Compose.

**Architecture:**
- **Backend**: Node.js Express API with Python RL model inference (Port 5000)
- **Frontend**: React/Vite compiled and served through Nginx (Port 80)
- **Communication**: Docker network bridge for inter-service communication

## Prerequisites

1. Install Docker: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
2. Install Docker Compose: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
3. Have the trained model file: `carematch_ppo.zip` in the project root

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd c:\Users\DEVANSH\Desktop\projects\carematch-rl

# Start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost
# - Backend API: http://localhost/api
```

### Option 2: Build and Run Individually

**Backend:**
```bash
cd backend
docker build -t carematch-backend .
docker run -p 5000:5000 --name carematch-backend carematch-backend
```

**Frontend:**
```bash
cd frontend
docker build -t carematch-frontend .
docker run -p 80:80 --name carematch-frontend --link carematch-backend:backend carematch-frontend
```

## File Structure

```
carematch-rl/
├── docker-compose.yml          # Orchestrates all services
├── .dockerignore               # Excludes unnecessary files
│
├── backend/
│   ├── Dockerfile              # Backend container configuration
│   ├── server.js               # Express server
│   ├── package.json            # Node dependencies
│   └── ...
│
├── frontend/
│   ├── Dockerfile              # Frontend container configuration
│   ├── nginx.conf              # Nginx reverse proxy config
│   ├── package.json            # React dependencies
│   ├── src/                    # React source
│   └── ...
│
├── env/                        # RL environment (Gymnasium)
├── inference.py                # Python prediction script
├── carematch_ppo.zip           # Trained model
└── ...
```

## Configuration

### Environment Variables

Create `.env` files for sensitive data:

**`backend/.env`:**
```
NODE_ENV=production
PORT=5000
```

**`frontend/.env`:**
```
VITE_OPENAI_KEY=your-api-key-here
```

### Port Mapping

| Service | Internal Port | External Port | Purpose |
|---------|---------------|---------------|---------|
| Backend | 5000 | 5000 | API endpoint |
| Frontend | 80 | 80 | Web application |

## Common Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove volumes (data loss!)
docker-compose down -v

# Rebuild without cache
docker-compose up --build --no-cache

# Run specific service
docker-compose up backend

# Access backend container shell
docker exec -it carematch-backend /bin/sh

# Access frontend container shell
docker exec -it carematch-frontend /bin/sh
```

## Health Checks

Both services include health checks:

```bash
# Check service status
docker-compose ps

# Check backend health
docker exec carematch-backend wget --no-verbose --tries=1 --spider http://localhost:5000/api/health

# Check frontend health
docker exec carematch-frontend wget --no-verbose --tries=1 --spider http://localhost/
```

## Networking

Services communicate via Docker network `carematch-network`:
- Frontend can reach backend at `http://backend:5000`
- Nginx proxies `/api` requests to backend service

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 80 or 5000
netstat -ano | findstr :80
netstat -ano | findstr :5000

# Stop the container
docker stop carematch-backend
docker stop carematch-frontend
```

### Python Model Not Found

Ensure `carematch_ppo.zip` exists in the project root. The backend will use a fallback heuristic if the model is missing.

### API Not Responding

Check backend logs:
```bash
docker-compose logs backend
```

### Frontend Showing 502 Bad Gateway

The backend service isn't healthy yet. Wait a moment for backend to start:
```bash
docker-compose logs -f backend
```

### Rebuild Everything from Scratch

```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

## Performance Tips

1. **Use `.dockerignore`** - Already configured to exclude unnecessary files
2. **Multi-stage builds** - Frontend uses multi-stage build for smaller image
3. **Alpine images** - Uses lighter Alpine Linux base images
4. **Layer caching** - Dependencies are installed before source code
5. **Production mode** - NODE_ENV set to production for both services

## Production Deployment

For production, consider:

1. **Use environment-specific compose files:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
   ```

2. **Use secret management:**
   ```bash
   echo "your-secret" | docker secret create openai_key -
   ```

3. **Enable restart policies:** Already configured with `restart: unless-stopped`

4. **Add logging drivers:**
   ```yaml
   logging:
     driver: "awslogs"
     options:
       awslogs-group: "/ecs/carematch"
   ```

5. **Use container registries:**
   ```bash
   docker tag carematch-backend myrepo/carematch-backend:latest
   docker push myrepo/carematch-backend:latest
   ```

## Useful Links

- Docker Docs: https://docs.docker.com/
- Docker Compose Docs: https://docs.docker.com/compose/
- Nginx Docs: https://nginx.org/
- Node.js Docker: https://hub.docker.com/_/node

## Support

For issues, check:
1. Docker logs: `docker-compose logs`
2. Service health: `docker-compose ps`
3. Network connectivity: `docker network ls`, `docker network inspect`
