# Environment Variables Setup

All important configuration values have been moved to `.env` files for easy management.

## FlashOrchestrator Configuration

Edit `FlashOrchestrator/.env` to configure:

```env
# Server ports
HTTP_PORT=3003
WS_PORT=8081

# AI Provider URLs
OLLAMA_BASE_URL=http://localhost:11434
LM_STUDIO_BASE_URL=http://localhost:1234
LITELLM_BASE_URL=http://localhost:4000

# OAuth
OAUTH_REDIRECT_URI=http://localhost:45289

# Debug mode
DEBUG=true
```

## UI Configuration

Edit `UI/.env` to configure:

```env
# API endpoint (used by the app at runtime)
VITE_API_URL=http://localhost:3003

# WebSocket endpoint (used by the app at runtime)
VITE_WS_URL=ws://localhost:8081
```

**Note:** The Vite dev server proxy in `vite.config.ts` uses hardcoded values. The env vars above are used by the React app at runtime for API calls.

## Usage

1. Copy `.env.example` to `.env` in each project if needed
2. Edit the `.env` files with your values
3. Restart the servers for changes to take effect

### FlashOrchestrator
```bash
cd FlashOrchestrator
npm run dev
```

### UI
```bash
cd UI
npm run dev
```

## Notes

- The `.env` files are already created with default values
- `.env.example` files show all available options
- Changes to `.env` require server restart
- UI changes require Vite dev server restart
