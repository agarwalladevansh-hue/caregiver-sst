# Docker Setup Summary

This directory contains everything needed to deploy CareMatch RL using Docker.

## Files Created

### Core Docker Files
- **docker-compose.yml** - Main orchestration file (development)
- **docker-compose.prod.yml** - Production configuration with resource limits
- **.dockerignore** - Exclusions for Docker build context

### Container Configurations
- **backend/Dockerfile** - Node.js + Python runtime for API server
- **frontend/Dockerfile** - Multi-stage build: Node build + Nginx serving
- **frontend/nginx.conf** - Nginx reverse proxy configuration

### Deployment Scripts
- **docker-deploy.sh** - Linux/Mac deployment automation script
- **docker-deploy.bat** - Windows deployment automation script
- **DOCKER_DEPLOYMENT.md** - Complete deployment documentation

## Quick Start

### Windows Users
```cmd
docker-deploy.bat
```

### Linux/Mac Users
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

### Or Use Docker Compose Directly
```bash
docker-compose up --build
```

## Architecture

```
┌──────────────────────┐
│   Web Browser        │
└──────────┬───────────┘
           │ http://localhost
           ▼
┌──────────────────────┐
│   Nginx Container    │ (port 80)
│   (Frontend)         │
└──────────┬───────────┘
           │ /api
           ▼
┌──────────────────────┐
│  Node.js Container   │ (port 5000)
│  (Backend API)       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Python Inference    │
│  (carematch_ppo.zip) │
└──────────────────────┘
```

## Service Details

### Backend Container
- **Image**: node:22-alpine
- **Port**: 5000 (internal), 5000 (external)
- **Services**: Express API, Python inference
- **Volumes**: Model file (read-only)
- **Health Check**: API endpoint polling

### Frontend Container  
- **Image**: nginx:alpine (production stage)
- **Port**: 80 (HTTP), 443 (HTTPS ready)
- **Services**: Static file serving, API proxy
- **Build**: Multi-stage (node:22 → nginx:alpine)
- **Health Check**: HTTP GET requests

## Available Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild images
docker-compose up --build

# Remove everything (careful!)
docker-compose down -v
docker system prune -a
```

## Accessing the Application

- **Frontend**: http://localhost
- **API**: http://localhost/api
- **Backend direct**: http://localhost:5000/api (for testing)

## Configuration

### Environment Variables

Set in `.env` files or docker-compose:

```yaml
environment:
  - NODE_ENV=production
  - PYTHONUNBUFFERED=1
  - PORT=5000
```

### API Proxy

Nginx automatically proxies `/api` requests to backend:
```nginx
location /api/ {
    proxy_pass http://backend:5000/api/;
}
```

## Requirements

- Docker >= 20.10
- Docker Compose >= 2.0
- ~2GB disk space for images
- carematch_ppo.zip in project root (optional, uses fallback if missing)

## Troubleshooting

### Port 80/5000 Already in Use

```bash
# Find process
netstat -tlnp | grep :80
netstat -tlnp | grep :5000

# Use different port in docker-compose.yml
ports:
  - "8000:80"      # Map external 8000 to internal 80
  - "5001:5000"    # Map external 5001 to internal 5000
```

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild everything
docker-compose down
docker system prune -a
docker-compose up --build
```

### Python Model Not Found

Backend falls back to heuristic predictions. Place `carematch_ppo.zip` in project root for actual ML predictions.

## Production Considerations

1. Use `docker-compose.prod.yml` for resource limits
2. Set resource constraints:
   - Backend: 1 CPU, 1GB RAM
   - Frontend: 1 CPU, 512MB RAM
3. Configure logging to centralized service
4. Use secrets management for API keys
5. Set up SSL/TLS certificates
6. Monitor container health
7. Implement backup strategy for model files

## Security

- Containers run as non-root
- API key stored in `.env` (not committed)
- Python modules have pinned versions
- Alpine base images (minimal attack surface)
- Health checks ensure service availability
- Read-only model volume

## Performance Tips

- Use Alpine images (smaller, faster)
- Multi-stage build for frontend (smaller image)
- Layer caching (install dependencies first)
- Health checks with appropriate intervals
- Resource limits prevent runaway containers

## Next Steps

1. **Deployment**: Push images to Docker Hub/Registry
2. **Orchestration**: Use Kubernetes for scaling
3. **Monitoring**: Add Prometheus/Grafana
4. **CI/CD**: Automate builds with GitHub Actions/GitLab CI
5. **Database**: Add persistent storage for bookings/favorites

## Support

See **DOCKER_DEPLOYMENT.md** for detailed documentation.

For issues:
1. Check container logs: `docker-compose logs`
2. Verify services are healthy: `docker-compose ps`
3. Test endpoints directly: `curl http://localhost/api/health`
