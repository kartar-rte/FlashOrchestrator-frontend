import { useState, useEffect } from 'react';
import { FolderOpen, File, Loader2, RefreshCw, Upload } from 'lucide-react';
import { apiService } from '../services/api';

export default function WorkspaceView() {
  const [workspacePath, setWorkspacePath] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const [currentWorkspace, setCurrentWorkspace] = useState<string>('');
  const [currentStoragePath, setCurrentStoragePath] = useState<string>('');

  const handleLoadWorkspace = async () => {
    if (!workspacePath.trim()) return;

    setLoading(true);
    try {
      const response = await apiService.loadWorkspace(workspacePath);
      if (response.success) {
        // Update current workspace display
        setCurrentWorkspace(response.workspacePath || workspacePath);
        setCurrentStoragePath(response.globalStoragePath || '');
        await fetchFiles();
        // Show success message
        alert(`Workspace loaded successfully!\n\nFiles found: ${response.fileCount || 0}\nWorkspace: ${response.workspacePath || workspacePath}\nStorage: ${response.globalStoragePath || 'Not set'}`);
      } else {
        throw new Error(response.error || 'Failed to load workspace');
      }
    } catch (error: any) {
      console.error('Failed to load workspace:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load workspace. Please check the path.';
      alert(`Failed to load workspace:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await apiService.getFiles();
      setFiles(response.files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handleFileSelect = async (filePath: string) => {
    setSelectedFile(filePath);
    try {
      const response = await apiService.getFile(filePath);
      setFileContent(response.content);
    } catch (error) {
      console.error('Failed to fetch file:', error);
      setFileContent('Error loading file');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Workspace
        </h3>

        <div className="space-y-3">
          {currentWorkspace && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="text-xs font-medium text-blue-900 mb-1">Current Workspace:</div>
              <div className="text-xs text-blue-700 font-mono break-all">{currentWorkspace}</div>
              {currentStoragePath && (
                <>
                  <div className="text-xs font-medium text-blue-900 mt-2 mb-1">Storage Path:</div>
                  <div className="text-xs text-blue-700 font-mono break-all">{currentStoragePath}</div>
                  <div className="text-xs text-blue-600 mt-2">
                    💡 Conversation history is stored in: <code className="bg-blue-100 px-1 rounded">tasks/&lt;taskId&gt;/api_conversation_history.json</code>
                  </div>
                </>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Load New Workspace Path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={workspacePath}
                onChange={(e) => setWorkspacePath(e.target.value)}
                placeholder="/path/to/workspace"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleLoadWorkspace}
                disabled={loading || !workspacePath.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Load
              </button>
            </div>
          </div>

          <button
            onClick={fetchFiles}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Files
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* File List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-2">
          <div className="text-sm font-medium text-gray-700 mb-2 px-2">
            Files ({files.length})
          </div>
          {files.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">
              No files loaded. Load a workspace first.
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file}
                  onClick={() => handleFileSelect(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    selectedFile === file
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <File className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{file}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* File Content */}
        <div className="w-1/2 overflow-y-auto p-4 bg-gray-50">
          {selectedFile ? (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {selectedFile}
              </div>
              <pre className="bg-white p-4 rounded-lg border border-gray-200 text-xs overflow-x-auto">
                {fileContent}
              </pre>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              Select a file to view its contents
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

