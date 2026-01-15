import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8081';

export interface WorkspaceConfig {
  workspacePath: string;
  globalStoragePath?: string;
  apiProvider: string;
  apiKey: string;
  apiModelId?: string;
  apiBaseUrl?: string;
  organizationId?: string;
}

export interface TaskCreateRequest {
  message: string;
  text?: string;
  images?: string[];
  options?: Record<string, any>;
}

export interface TaskMessageRequest {
  taskId: string;
  message: string;
  images?: string[];
}

export interface TaskStatus {
  success: boolean;
  taskId: string;
  status: 'running' | 'initializing' | 'completed' | 'paused';
  isPaused: boolean;
  mode: string;
}

export interface Task {
  id: string;
  task: string;
  mode: string;
  timestamp: number;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async initializeWorkspace(config: WorkspaceConfig) {
    const response = await this.api.post('/api/workspace/initialize', config);
    return response.data;
  }

  async createTask(request: TaskCreateRequest) {
    const response = await this.api.post('/api/task/create', request);
    return response.data;
  }

  async sendTaskMessage(request: TaskMessageRequest) {
    const response = await this.api.post('/api/task/message', request);
    return response.data;
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const response = await this.api.get(`/api/task/${taskId}/status`);
    return response.data;
  }

  async getTasks(): Promise<{ success: boolean; tasks: Task[] }> {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api.ts:72', message: 'getTasks called', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion
    const response = await this.api.get('/api/tasks');
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api.ts:74', message: 'getTasks response', data: { success: response.data.success, tasksCount: response.data.tasks?.length || 0, taskIds: response.data.tasks?.map((t: Task) => t.id) || [] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion
    return response.data;
  }

  async deleteTask(taskId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await this.api.delete(`/api/task/${taskId}`);
    return response.data;
  }

  async getConversationHistory(taskId: string): Promise<{ success: boolean; messages: any[] }> {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api.ts:77', message: 'getConversationHistory called', data: { taskId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
    // #endregion
    const response = await this.api.get(`/api/task/${taskId}/conversation-history`);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api.ts:79', message: 'getConversationHistory response', data: { taskId, success: response.data.success, messagesCount: response.data.messages?.length || 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
    // #endregion
    return response.data;
  }

  async updateConfig(config: Partial<WorkspaceConfig>) {
    const response = await this.api.post('/api/config/update', config);
    return response.data;
  }

  async loadWorkspace(workspacePath: string): Promise<{ success: boolean; fileCount?: number; files?: string[]; workspacePath?: string; globalStoragePath?: string; error?: string }> {
    const response = await this.api.post('/api/load-workspace', { workspacePath });
    return response.data;
  }

  async getFiles(): Promise<{ files: string[] }> {
    const response = await this.api.get('/api/files');
    return response.data;
  }

  async getFile(filePath: string): Promise<{ content: string; path: string }> {
    const response = await this.api.get(`/api/file/${encodeURIComponent(filePath)}`);
    return response.data;
  }

  async writeFile(filePath: string, content: string) {
    const response = await this.api.post('/api/write-file', { filePath, content });
    return response.data;
  }

  async analyzeVisualization(data: string): Promise<any> {
    const response = await this.api.post('/api/visualize/analyze', { data });
    return response.data;
  }

  createWebSocket(onMessage: (event: string, data: any) => void): WebSocket {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.data?.message?.say !== "api_req_started") {
          onMessage(message.type || 'message', message.data || message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return ws;
  }
}

export const apiService = new ApiService();

