import { useState, useEffect } from 'react';
import { Database, FileText, Settings } from 'lucide-react';
import { 
  loadEnhancementConfig, 
  saveEnhancementConfig, 
  USE_CASE_TEMPLATES,
  type QueryEnhancementConfig 
} from '../utils/queryEnhancer';

export default function QueryEnhancementSettings() {
  const [config, setConfig] = useState<QueryEnhancementConfig>(loadEnhancementConfig());
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');

  useEffect(() => {
    saveEnhancementConfig(config);
  }, [config]);

  const applyUseCaseTemplate = (useCaseKey: keyof typeof USE_CASE_TEMPLATES) => {
    const template = USE_CASE_TEMPLATES[useCaseKey];
    setConfig({
      ...config,
      instructions: template.instructions,
    });
    setSelectedUseCase(useCaseKey);
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Query Enhancement (Instruction-Driven)
      </h3>

      <div className="space-y-4">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Enable Query Enhancement
            </label>
            <p className="text-xs text-gray-500">
              Always instruct orchestrator to use database and file tools
            </p>
          </div>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.enabled ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.enabled && (
          <>
            {/* Use Case Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Case Templates
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(USE_CASE_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => applyUseCaseTemplate(key as keyof typeof USE_CASE_TEMPLATES)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      selectedUseCase === key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.instructions.substring(0, 60)}...</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Instructions
              </label>
              <textarea
                value={config.instructions}
                onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                placeholder="Enter custom instructions for the orchestrator..."
              />
              <p className="text-xs text-gray-500 mt-1">
                These instructions will be appended to every user query
              </p>
            </div>

            {/* Source Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Enable Database Tools
                    </label>
                    <p className="text-xs text-gray-500">
                      Include instructions to use SQL/database tools
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, databaseEnabled: !config.databaseEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.databaseEnabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.databaseEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Enable File Search Tools
                    </label>
                    <p className="text-xs text-gray-500">
                      Include instructions to use file tools
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, fileSearchEnabled: !config.fileSearchEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.fileSearchEnabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.fileSearchEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Skip if in memory */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Skip Tools if Answer in Memory
                </label>
                <p className="text-xs text-gray-500">
                  Allow orchestrator to skip tools if answer already in conversation
                </p>
              </div>
              <button
                onClick={() => setConfig({ ...config, skipIfInMemory: !config.skipIfInMemory })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.skipIfInMemory ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.skipIfInMemory ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>How it works:</strong> When enabled, your queries are automatically enhanced with instructions 
                that guide the orchestrator to use the appropriate tools. This ensures queries that need both 
                database and file data get comprehensive answers. The orchestrator will always use tools unless 
                the answer is already present in the conversation history.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

