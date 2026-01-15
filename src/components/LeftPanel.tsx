import { useState } from 'react';
import { MessageSquare, Settings, FolderOpen, BarChart3, ChevronRight, ChevronLeft } from 'lucide-react';
import { Task } from '../services/api';
import ChatThreads from './ChatThreads';

interface LeftPanelProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  currentView: 'threads' | 'settings' | 'workspace' | 'observability';
  onViewChange: (view: 'threads' | 'settings' | 'workspace' | 'observability') => void;
  onNewThread: () => void;
  onDeleteTask: (taskId: string) => void;
}

export default function LeftPanel({
  tasks,
  selectedTaskId,
  onSelectTask,
  currentView,
  onViewChange,
  onNewThread,
  onDeleteTask,
}: LeftPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'threads' as const, icon: MessageSquare, label: 'Chat Threads' },
    { id: 'settings' as const, icon: Settings, label: 'Orchestrator Settings' },
    { id: 'workspace' as const, icon: FolderOpen, label: 'Workspace' },
    { id: 'observability' as const, icon: BarChart3, label: 'Observability' },
  ];

  if (isCollapsed) {
    return (
      <div className="w-[60px] bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Collapsed Navigation - Icons Only */}
        <div className="flex-1 flex flex-col items-center py-4 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Expand Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Orchestrator</h1>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="p-2 border-b border-gray-200 bg-white">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area - Only show ChatThreads in left panel */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'threads' && (
          <ChatThreads
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={onSelectTask}
            onNewThread={onNewThread}
            onDeleteTask={onDeleteTask}
          />
        )}
        {currentView !== 'threads' && (
          <div className="p-4 text-center text-gray-500 text-sm">
            Select a view to see details in the center panel
          </div>
        )}
      </div>
    </div>
  );
}

