import { useState, useEffect } from 'react';
import { Save, Key, Server, Brain, Settings, AlertCircle, FolderOpen } from 'lucide-react';
import { apiService, WorkspaceConfig } from '../services/api';
import QueryEnhancementSettings from './QueryEnhancementSettings';
import UseCaseManagement from './UseCaseManagement';

const STORAGE_KEY = 'orchestrator_config';

function loadConfigFromStorage(): Partial<WorkspaceConfig> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load config from storage:', error);
  }
  return {
    apiProvider: 'openai',
    apiModelId: 'gpt-4',
    workspacePath: '',
  };
}

function saveConfigToStorage(config: Partial<WorkspaceConfig>) {
  try {
    // Don't save empty values
    const configToSave = { ...config };
    Object.keys(configToSave).forEach(key => {
      if (configToSave[key as keyof WorkspaceConfig] === '' || configToSave[key as keyof WorkspaceConfig] === undefined) {
        delete configToSave[key as keyof WorkspaceConfig];
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
  } catch (error) {
    console.error('Failed to save config to storage:', error);
  }
}

export default function OrchestratorSettings() {
  const savedConfig = loadConfigFromStorage();
  const [config, setConfig] = useState<Partial<WorkspaceConfig>>(() => savedConfig || {
    apiProvider: 'openai',
    apiModelId: 'gpt-4',
    workspacePath: '',
  });
  const [savedApiKey, setSavedApiKey] = useState<string | undefined>(savedConfig?.apiKey);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaceInitialized, setWorkspaceInitialized] = useState(false);

  useEffect(() => {
    // Check if workspace is initialized by trying to get tasks
    apiService.getTasks()
      .then(() => setWorkspaceInitialized(true))
      .catch(() => setWorkspaceInitialized(false));
  }, []);

  // Save to localStorage whenever config changes (but not on initial load)
  useEffect(() => {
    // Only save if we have meaningful data
    if (config.apiKey || config.workspacePath || config.apiProvider) {
      saveConfigToStorage(config);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Use saved API key if current field is empty (user didn't change it)
      const apiKeyToUse = config.apiKey || savedApiKey;
      
      if (!apiKeyToUse) {
        setError('API key is required');
        setSaving(false);
        return;
      }

      // Prepare config with the API key
      const configToSave = {
        ...config,
        apiKey: apiKeyToUse,
      };

      // Save to localStorage first
      saveConfigToStorage(configToSave);
      setSavedApiKey(apiKeyToUse);

      // If workspace is not initialized, initialize it first
      if (!workspaceInitialized) {
        if (!config.workspacePath || !config.apiProvider) {
          setError('Workspace path and API provider are required to initialize workspace');
          setSaving(false);
          return;
        }

        // Initialize workspace with full config
        await apiService.initializeWorkspace({
          workspacePath: config.workspacePath,
          apiProvider: config.apiProvider,
          apiKey: apiKeyToUse,
          apiModelId: config.apiModelId,
          apiBaseUrl: config.apiBaseUrl,
          organizationId: config.organizationId,
        });
        
        setWorkspaceInitialized(true);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        // Just update config if workspace is already initialized
        await apiService.updateConfig({
          apiProvider: config.apiProvider,
          apiKey: apiKeyToUse,
          apiModelId: config.apiModelId,
          apiBaseUrl: config.apiBaseUrl,
          organizationId: config.organizationId,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error: any) {
      console.error('Failed to save configuration:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save configuration';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          API Configuration
        </h3>

        {!workspaceInitialized && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Workspace not initialized</p>
                <p>Please provide a workspace path to initialize the orchestrator.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {saved && !error && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-800 font-medium">Configuration saved successfully!</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {!workspaceInitialized && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Workspace Path (Required for initialization)
              </label>
              <input
                type="text"
                value={config.workspacePath || ''}
                onChange={(e) => setConfig({ ...config, workspacePath: e.target.value })}
                placeholder="/path/to/workspace or C:\path\to\workspace"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the absolute path to your workspace directory. Examples:
                <br />
                • macOS/Linux: <code className="bg-gray-100 px-1 rounded">/Users/username/projects/myapp</code> or <code className="bg-gray-100 px-1 rounded">~/projects/myapp</code>
                <br />
                • Windows: <code className="bg-gray-100 px-1 rounded">C:\Users\username\projects\myapp</code>
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Provider
            </label>
            <select
              value={config.apiProvider || 'openai'}
              onChange={(e) => setConfig({ ...config, apiProvider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey || ''}
              onChange={(e) => {
                const newKey = e.target.value;
                setConfig({ ...config, apiKey: newKey });
                if (newKey) {
                  setSavedApiKey(newKey);
                }
              }}
              placeholder={savedApiKey && !config.apiKey ? 'API key saved (enter new key to change)' : 'Enter your API key'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {savedApiKey && !config.apiKey && (
              <p className="text-xs text-gray-500 mt-1">
                Using saved API key. Enter a new key above to change it.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Model ID
            </label>
            <input
              type="text"
              value={config.apiModelId || ''}
              onChange={(e) => setConfig({ ...config, apiModelId: e.target.value })}
              placeholder="e.g., gpt-4o, gpt-4-turbo, claude-3-5-sonnet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended models with large context windows:
              <br />
              • OpenAI: <code className="bg-gray-100 px-1 rounded">gpt-4o</code> (128K), <code className="bg-gray-100 px-1 rounded">gpt-4-turbo</code> (128K)
              <br />
              • Anthropic: <code className="bg-gray-100 px-1 rounded">claude-3-5-sonnet-20241022</code> (200K)
              <br />
              ⚠️ Avoid <code className="bg-gray-100 px-1 rounded">gpt-4</code> (8K limit) - system prompt alone exceeds this
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Server className="w-4 h-4" />
              API Base URL (Optional)
            </label>
            <input
              type="text"
              value={config.apiBaseUrl || ''}
              onChange={(e) => setConfig({ ...config, apiBaseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !config.apiProvider || (!config.apiKey && !savedApiKey) || (!workspaceInitialized && !config.workspacePath)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving 
              ? 'Saving...' 
              : saved 
              ? 'Saved!' 
              : workspaceInitialized 
              ? 'Update Configuration' 
              : 'Initialize Workspace & Save Configuration'}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Tools</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            The orchestrator has access to the following tools:
          </p>
          {/* TODO: Fetch tools dynamically from API endpoint when available */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              'codebase_search',
              'read_file',
              'write_file',
              'run_terminal_command',
              'browser_action',
              'update_todo_list',
              'generate_image',
            ].map((tool) => (
              <div
                key={tool}
                className="bg-white px-3 py-2 rounded border border-gray-200"
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Prompts</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            System prompts and logic are configured in the orchestrator backend.
            These control how the AI agent behaves and what instructions it follows.
          </p>
        </div>
      </div>

      <QueryEnhancementSettings />

      <UseCaseManagement />
    </div>
  );
}

