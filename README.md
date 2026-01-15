# Orchestrator UI

A modern web interface for interacting with the Flash Orchestrator API. This UI provides a three-panel layout for managing chat threads, viewing output, and controlling the orchestrator.

## Features

- **Left Panel**: 
  - Chat Threads: View and manage all conversation threads
  - Orchestrator Settings: Configure API keys, models, and view available tools
  - Workspace: Load and browse workspace files
  - Observability: Monitor task performance and system health

- **Center Panel**: 
  - Real-time output preview with markdown rendering
  - Code syntax highlighting
  - Tool usage visualization

- **Right Panel**: 
  - Agent chat interface
  - Send messages to create new tasks or continue existing conversations
  - Task status display

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Flash Orchestrator API running on `http://localhost:3003` (default)
- WebSocket server running on `ws://localhost:8081` (default)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open your browser to `http://localhost:5173`

### Configuration

You can configure the API endpoints by creating a `.env` file:

```env
VITE_API_URL=http://localhost:3003
VITE_WS_URL=ws://localhost:8081
```

## Usage

1. **Initialize Workspace**: Go to Settings and configure your API keys, then load a workspace in the Workspace view.

2. **Start a Conversation**: Type a message in the right panel to create a new task.

3. **View Output**: Watch real-time updates in the center panel as the orchestrator processes your requests.

4. **Monitor Performance**: Check the Observability view to see task metrics and tool usage.

## Project Structure

```
UI/
├── src/
│   ├── components/       # React components
│   │   ├── LeftPanel.tsx
│   │   ├── CenterPanel.tsx
│   │   ├── RightPanel.tsx
│   │   ├── ChatThreads.tsx
│   │   ├── OrchestratorSettings.tsx
│   │   ├── WorkspaceView.tsx
│   │   └── ObservabilityView.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useWebSocket.ts
│   │   └── useTasks.ts
│   ├── services/         # API service layer
│   │   └── api.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## API Endpoints Used

- `POST /api/workspace/initialize` - Initialize workspace
- `POST /api/task/create` - Create new task
- `POST /api/task/message` - Send message to task
- `GET /api/task/:taskId/status` - Get task status
- `GET /api/tasks` - List all tasks
- `POST /api/config/update` - Update configuration
- `POST /api/load-workspace` - Load workspace
- `GET /api/files` - List files
- `GET /api/file/:filePath` - Get file content
- `POST /api/write-file` - Write file

## WebSocket Events

The UI listens to the following WebSocket events:
- `message` / `taskMessage` - Task messages
- `toolUse` - Tool usage events
- `statusChange` - Task status changes
- `taskCompleted` - Task completion
- `taskStarted` - Task start
- `taskAborted` - Task abortion
- `log` - Log entries
- `todoListUpdate` - Todo list updates

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Markdown
- React Syntax Highlighter
- Lucide React (icons)
- date-fns

