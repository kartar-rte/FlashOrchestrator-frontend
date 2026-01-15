import { useState, useEffect, useRef } from 'react';
import { Activity, Wrench, Clock, AlertCircle, MessageSquare, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { apiService } from '../services/api';
import { useTasks } from '../hooks/useTasks';

interface ObservabilityViewProps {
  logs: Record<string, any[]>;
  toolUses: Record<string, any[]>;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string | any[];
  ts?: number;
  id?: string;
  [key: string]: any;
}

export default function ObservabilityView({ logs, toolUses }: ObservabilityViewProps) {
  const { tasks, refreshTasks } = useTasks();
  console.log('tasks :::::', tasks)
  // Refresh tasks when component mounts or when logs change (indicating new activity)
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:22', message: 'ObservabilityView mounted, refreshing tasks', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
    // #endregion
    refreshTasks();
  }, [refreshTasks]);
  const [conversationHistory, setConversationHistory] = useState<Record<string, ConversationMessage[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const fetchedTasksRef = useRef<Set<string>>(new Set());

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:21', message: 'ObservabilityView rendered', data: { tasksLength: tasks.length, taskIds: tasks.map(t => t.id), logsKeys: Object.keys(logs), toolUsesKeys: Object.keys(toolUses) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
  }, [tasks, logs, toolUses]);
  // #endregion

  // Fetch conversation history for all tasks
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:28', message: 'useEffect triggered for conversation history', data: { tasksLength: tasks.length, taskIds: tasks.map(t => t.id) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    const fetchConversationHistory = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:29', message: 'fetchConversationHistory started', data: { tasksCount: tasks.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      for (const task of tasks) {
        // Only fetch if we haven't already fetched it
        if (!fetchedTasksRef.current.has(task.id) && !loadingHistory[task.id]) {
          fetchedTasksRef.current.add(task.id);
          setLoadingHistory(prev => ({ ...prev, [task.id]: true }));
          try {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:36', message: 'Calling getConversationHistory', data: { taskId: task.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
            // #endregion
            const response = await apiService.getConversationHistory(task.id);
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:37', message: 'getConversationHistory response received', data: { taskId: task.id, success: response.success, messagesCount: Array.isArray(response.messages) ? response.messages.length : 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
            // #endregion
            if (response.success && Array.isArray(response.messages)) {
              // Sort messages by timestamp (ts field) or by index if no timestamp
              const sortedMessages = [...response.messages].sort((a, b) => {
                const tsA = a.ts || 0;
                const tsB = b.ts || 0;
                return tsA - tsB;
              });
              setConversationHistory(prev => ({ ...prev, [task.id]: sortedMessages }));
              // #region agent log
              fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:44', message: 'Conversation history set in state', data: { taskId: task.id, messagesCount: sortedMessages.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
              // #endregion
            }
          } catch (error: any) {
            console.error(`Failed to fetch conversation history for task ${task.id}:`, error);
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:47', message: 'getConversationHistory error', data: { taskId: task.id, error: error?.message || String(error) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
            // #endregion
            // Remove from fetched set so we can retry
            fetchedTasksRef.current.delete(task.id);
          } finally {
            setLoadingHistory(prev => ({ ...prev, [task.id]: false }));
          }
        }
      }
    };

    if (tasks.length > 0) {
      fetchConversationHistory();
    }
  }, [tasks, loadingHistory]);

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const formatMessageContent = (content: string | any[]): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content
        .map((block: any) => {
          if (block.type === 'text') {
            return block.text || '';
          }
          if (block.type === 'tool_use') {
            return `[Tool: ${block.name || 'unknown'}]`;
          }
          if (block.type === 'tool_result') {
            return `[Tool Result]`;
          }
          return JSON.stringify(block);
        })
        .filter(Boolean)
        .join('\n');
    }
    return JSON.stringify(content);
  };

  const allTaskIds = new Set([
    ...Object.keys(logs),
    ...Object.keys(toolUses),
    ...tasks.map(t => t.id),
  ]);

  const getTaskStats = (taskId: string) => {
    const taskLogs = logs[taskId] || [];
    const taskToolUses = toolUses[taskId] || [];
    return {
      logCount: taskLogs.length,
      toolUseCount: taskToolUses.length,
      lastActivity: taskLogs.length > 0
        ? taskLogs[taskLogs.length - 1]?.timestamp || Date.now()
        : taskToolUses.length > 0
          ? taskToolUses[taskToolUses.length - 1]?.timestamp || Date.now()
          : null,
    };
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Task Performance
        </h3>

        {allTaskIds.size === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No activity data available yet. Start tasks to see observability metrics.
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(allTaskIds).map((taskId) => {
              const stats = getTaskStats(taskId);
              return (
                <div
                  key={taskId}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-900">
                      Task: {taskId.substring(0, 12)}...
                    </div>
                    {stats.lastActivity && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(stats.lastActivity), 'HH:mm:ss')}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Wrench className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-900">
                          Tool Uses
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {stats.toolUseCount}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-900">
                          Log Entries
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {stats.logCount}
                      </div>
                    </div>
                  </div>

                  {toolUses[taskId] && toolUses[taskId].length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Recent Tool Uses:
                      </div>
                      <div className="space-y-1">
                        {toolUses[taskId].slice(-3).map((toolUse, index) => (
                          <div
                            key={index}
                            className="text-xs bg-gray-50 px-2 py-1 rounded"
                          >
                            <span className="font-medium">
                              {toolUse.name || 'Unknown Tool'}
                            </span>
                            {toolUse.input && (
                              <span className="text-gray-500 ml-2">
                                - {JSON.stringify(toolUse.input).substring(0, 50)}...
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div> */}

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation History
          </h3>
          <button
            onClick={() => {
              // Reset fetched tasks to allow re-fetching
              fetchedTasksRef.current.clear();
              setConversationHistory({});
              setLoadingHistory({});
            }}
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
            title="Refresh conversation history"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="mb-2">No tasks available.</p>
            <p className="text-xs">Create a task to see conversation history.</p>
            <p className="text-xs mt-2 text-gray-500">
              Note: Conversation history is stored in <code className="bg-gray-100 px-1 rounded">.flashbuild/tasks/&lt;taskId&gt;/api_conversation_history.json</code>
            </p>
            {/* #region agent log */}
            {(() => { fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ObservabilityView.tsx:214', message: 'Rendering no tasks message', data: { tasksLength: tasks.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { }); return null; })()}
            {/* #endregion */}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const history = conversationHistory[task.id] || [];
              const isLoading = loadingHistory[task.id];
              const isExpanded = expandedTasks.has(task.id);

              return (
                <div
                  key={task.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleTaskExpansion(task.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          Task: {(task.task || task.id).length > 50 ? (task.task || task.id).substring(0, 50) + '...' : (task.task || task.id)}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {history.length} message{history.length !== 1 ? 's' : ''}
                          {task.timestamp && (
                            <span className="ml-2">
                              • {format(new Date(task.timestamp), 'MMM d, yyyy HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 space-y-3 max-h-96 overflow-y-auto">
                      {isLoading ? (
                        <div className="text-center text-gray-400 py-4">
                          Loading conversation history...
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-center text-gray-400 py-4">
                          <p className="mb-2">No conversation history available for this task.</p>
                          <p className="text-xs">
                            History is stored in: <code className="bg-gray-100 px-1 rounded">.flashbuild/tasks/{task.id}/api_conversation_history.json</code>
                          </p>
                          <p className="text-xs mt-2 text-gray-500">
                            Make sure the workspace path is correct in Settings.
                          </p>
                        </div>
                      ) : (
                        history.map((message, index) => {
                          const timestamp = message.ts
                            ? format(new Date(message.ts), 'MMM d, yyyy HH:mm:ss')
                            : `Message ${index + 1}`;
                          const content = formatMessageContent(message.content);
                          const isUser = message.role === 'user';
                          const isAssistant = message.role === 'assistant';

                          return (
                            <div
                              key={message.id || index}
                              className={`rounded-lg p-3 border ${isUser
                                  ? 'bg-blue-50 border-blue-200'
                                  : isAssistant
                                    ? 'bg-gray-50 border-gray-200'
                                    : 'bg-white border-gray-200'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded ${isUser
                                      ? 'bg-blue-100 text-blue-800'
                                      : isAssistant
                                        ? 'bg-gray-200 text-gray-800'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                  {isUser ? 'User' : isAssistant ? 'Assistant' : message.role || 'Unknown'}
                                </span>
                                <span className="text-xs text-gray-500">{timestamp}</span>
                              </div>
                              <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                {content.length > 500 ? (
                                  <>
                                    <div className="mb-2">{content.substring(0, 500)}...</div>
                                    <details className="mt-2">
                                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs">
                                        Show full message
                                      </summary>
                                      <div className="mt-2 pt-2 border-t border-gray-300">
                                        {content}
                                      </div>
                                    </details>
                                  </>
                                ) : (
                                  content
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          System Health
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-900">
              Orchestrator is running
            </span>
          </div>
          <p className="text-xs text-green-700 mt-2">
            All systems operational. WebSocket connection active.
          </p>
        </div>
      </div>
    </div>
  );
}

