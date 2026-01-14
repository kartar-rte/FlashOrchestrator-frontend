import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Database, FileText, Settings } from 'lucide-react';
import {
  loadUseCases,
  saveUseCases,
  createUseCase,
  updateUseCase,
  deleteUseCase,
  getSelectedUseCaseId,
  setSelectedUseCaseId,
  type UseCase,
  DEFAULT_USE_CASE,
} from '../utils/useCaseManager';

export default function UseCaseManagement() {
  const [useCases, setUseCases] = useState<UseCase[]>(loadUseCases());
  const [selectedId, setSelectedId] = useState<string>(getSelectedUseCaseId());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUseCase, setEditingUseCase] = useState<Partial<UseCase> | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUseCase, setNewUseCase] = useState<Partial<UseCase>>({
    name: '',
    instructions: '',
    databaseEnabled: true,
    fileSearchEnabled: true,
    skipIfInMemory: true,
  });

  useEffect(() => {
    setUseCases(loadUseCases());
    setSelectedId(getSelectedUseCaseId());
  }, []);

  const handleSelectUseCase = (id: string) => {
    setSelectedUseCaseId(id);
    setSelectedId(id);
  };

  const handleCreateUseCase = () => {
    if (!newUseCase.name || !newUseCase.instructions) {
      alert('Name and instructions are required');
      return;
    }

    const created = createUseCase({
      name: newUseCase.name!,
      instructions: newUseCase.instructions!,
      databaseEnabled: newUseCase.databaseEnabled ?? true,
      fileSearchEnabled: newUseCase.fileSearchEnabled ?? true,
      skipIfInMemory: newUseCase.skipIfInMemory ?? true,
    });

    setUseCases(loadUseCases());
    setSelectedId(created.id);
    setSelectedUseCaseId(created.id);
    setShowCreateForm(false);
    setNewUseCase({
      name: '',
      instructions: '',
      databaseEnabled: true,
      fileSearchEnabled: true,
      skipIfInMemory: true,
    });
  };

  const handleStartEdit = (useCase: UseCase) => {
    setEditingId(useCase.id);
    setEditingUseCase({ ...useCase });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingUseCase) return;

    const updated = updateUseCase(editingId, editingUseCase);
    if (updated) {
      setUseCases(loadUseCases());
      setEditingId(null);
      setEditingUseCase(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingUseCase(null);
  };

  const handleDeleteUseCase = (id: string) => {
    if (id === DEFAULT_USE_CASE.id) {
      alert('Cannot delete the default AIDO Queries use case');
      return;
    }

    if (window.confirm('Are you sure you want to delete this use case?')) {
      if (deleteUseCase(id)) {
        setUseCases(loadUseCases());
        if (selectedId === id) {
          setSelectedId(DEFAULT_USE_CASE.id);
          setSelectedUseCaseId(DEFAULT_USE_CASE.id);
        }
      }
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Use Case Management
        </h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Use Case
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Create and manage use cases with custom query enhancement prompts. Select a use case in the chat interface to apply it to your queries.
      </p>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Use Case Name *
              </label>
              <input
                type="text"
                value={newUseCase.name || ''}
                onChange={(e) => setNewUseCase({ ...newUseCase, name: e.target.value })}
                placeholder="e.g., Generate Insights, AIDO Queries"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions (Query Enhancement Prompt) *
              </label>
              <textarea
                value={newUseCase.instructions || ''}
                onChange={(e) => setNewUseCase({ ...newUseCase, instructions: e.target.value })}
                rows={10}
                placeholder="Enter the instructions that will be appended to user queries..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                These instructions guide the orchestrator on how to process queries for this use case.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-db-enabled"
                  checked={newUseCase.databaseEnabled ?? true}
                  onChange={(e) => setNewUseCase({ ...newUseCase, databaseEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="new-db-enabled" className="text-sm text-gray-700 flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  Enable Database Tools
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-file-enabled"
                  checked={newUseCase.fileSearchEnabled ?? true}
                  onChange={(e) => setNewUseCase({ ...newUseCase, fileSearchEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="new-file-enabled" className="text-sm text-gray-700 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Enable File Search Tools
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateUseCase}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Create Use Case
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewUseCase({
                    name: '',
                    instructions: '',
                    databaseEnabled: true,
                    fileSearchEnabled: true,
                    skipIfInMemory: true,
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Cases List */}
      <div className="space-y-3">
        {useCases.map((useCase) => (
          <div
            key={useCase.id}
            className={`p-4 border rounded-lg transition-colors ${
              selectedId === useCase.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {editingId === useCase.id ? (
              // Edit Mode
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingUseCase?.name || ''}
                    onChange={(e) => setEditingUseCase({ ...editingUseCase, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={editingUseCase?.instructions || ''}
                    onChange={(e) => setEditingUseCase({ ...editingUseCase, instructions: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingUseCase?.databaseEnabled ?? true}
                      onChange={(e) => setEditingUseCase({ ...editingUseCase, databaseEnabled: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <label className="text-sm text-gray-700">Database Tools</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingUseCase?.fileSearchEnabled ?? true}
                      onChange={(e) => setEditingUseCase({ ...editingUseCase, fileSearchEnabled: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <label className="text-sm text-gray-700">File Search Tools</label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{useCase.name}</h4>
                      {selectedId === useCase.id && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                      {useCase.id === DEFAULT_USE_CASE.id && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {useCase.instructions.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`flex items-center gap-1 ${useCase.databaseEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                        <Database className="w-3 h-3" />
                        Database
                      </span>
                      <span className={`flex items-center gap-1 ${useCase.fileSearchEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                        <FileText className="w-3 h-3" />
                        Files
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleSelectUseCase(useCase.id)}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        selectedId === useCase.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedId === useCase.id ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => handleStartEdit(useCase)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {useCase.id !== DEFAULT_USE_CASE.id && (
                      <button
                        onClick={() => handleDeleteUseCase(useCase.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {useCases.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No use cases yet. Create your first use case above.</p>
        </div>
      )}
    </div>
  );
}

