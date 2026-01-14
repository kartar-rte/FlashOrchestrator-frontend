# FlashOrchestrator Frontend Deployment Guide

## Domain Configuration
- **Frontend**: vibecode.rtesoftwares.com
- **Backend API**: api.vibecode.rtesoftwares.com
- **WebSocket**: ws.vibecode.rtesoftwares.com

## Environment Files

### `.env` (Local Development)
```
VITE_API_URL=http://localhost:3003
VITE_WS_URL=ws://localhost:8081
```

### `.env.production` (Production)
```
VITE_API_URL=https://api.vibecode.rtesoftwares.com
VITE_WS_URL=wss://ws.vibecode.rtesoftwares.com
```

## Local Development

```bash
npm install
npm run dev
```

Access at: http://localhost:5174

## Production Build

```bash
# Build for production
npm run build:prod

# Preview production build locally
npm run start
```

## Production Deployment

### Option 1: Development Mode (Quick Start)
```bash
npm run dev
```

### Option 2: Production Build + Serve
```bash
# Build
npm run build:prod

# Serve with a static server
npm install -g serve
serve -s dist -l 5173
```

### Option 3: PM2 (Recommended)
```bash
# Development mode
pm2 start npm --name "vibecode-frontend" -- run dev

# Or production build
npm run build:prod
pm2 start npm --name "vibecode-frontend" -- run start
```

## Nginx Configuration

The frontend will be served through Nginx reverse proxy:
- Nginx listens on port 80/443
- Proxies to localhost:5174
- Domain: vibecode.rtesoftwares.com

## Notes

- The frontend automatically uses the correct API URLs based on the environment
- In development, it uses localhost
- In production, it uses the configured domain URLs
- WebSocket connections are automatically upgraded to WSS in production (HTTPS)
