import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '../hooks/useWebSocket';
import OrchestratorSettings from './OrchestratorSettings';
import WorkspaceView from './WorkspaceView';
import ObservabilityView from './ObservabilityView';
import MessageRenderer from './MessageRenderer';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface CenterPanelProps {
  taskId: string | null;
  messages: WebSocketMessage[];
  toolUses: Record<string, any[]>;
  currentView: 'threads' | 'settings' | 'workspace' | 'observability';
  logs: Record<string, any[]>;
  status?: any;
}

export default function CenterPanel({ taskId, messages, toolUses, currentView, logs, status }: CenterPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  
  const filteredMessages = taskId
    ? messages.filter((msg) => msg.taskId === taskId || !msg.taskId)
    : messages;

  // Filter for final output - completion_result messages



  useEffect(() => {
    if (scrollRef.current && currentView === 'threads') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentView]);

  // Render different views based on currentView
  if (currentView === 'settings') {
    return (
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Orchestrator Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <OrchestratorSettings />
        </div>
      </div>
    );
  }

  if (currentView === 'workspace') {
    return (
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Workspace</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <WorkspaceView />
        </div>
      </div>
    );
  }

  if (currentView === 'observability') {
    return (
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Observability</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ObservabilityView logs={logs} toolUses={toolUses} />
        </div>
      </div>
    );
  }

  // Default: Output Preview for threads - Show only final result
  // Filter for completion_result messages only
  const completionMessages = filteredMessages.filter((msg) => {
    const messageData = msg.data?.message || msg.data;
    if (messageData?.say === 'completion_result') return true;
    if (messageData?.ask === 'completion_result') return true;
    if (msg.data?.say === 'completion_result' || msg.type === 'completion_result') return true;
    if (msg.data?.ask === 'completion_result') return true;
    return false;
  });

  // If collapsed, show only a thin bar with expand button
  if (isCollapsed) {
    return (
      <div className="flex flex-col bg-gray-100 border-l border-gray-200" style={{ width: '48px', minWidth: '48px' }}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 hover:bg-gray-200 transition-colors flex items-center justify-center"
          title="Expand Final Result"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <div className="transform -rotate-90 whitespace-nowrap text-sm font-medium text-gray-600">
            Final Result
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white border-l border-gray-200" style={{ width: '400px', minWidth: '400px' }}>
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Final Result</h2>
          {taskId && (
            <p className="text-sm text-gray-500 mt-1">Task ID: {taskId.substring(0, 8)}...</p>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="Collapse panel"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {!taskId || completionMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">Final result will appear here when the task is complete.</p>
          </div>
        ) : (
          <MessageRenderer messages={completionMessages} />
        )}
      </div>
    </div>
  );
}



