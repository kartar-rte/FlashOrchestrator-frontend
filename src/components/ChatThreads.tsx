import { format } from 'date-fns';
import { Plus, Trash2, MessageCircle } from 'lucide-react';
import { Task } from '../services/api';

interface ChatThreadsProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onNewThread: () => void;
  onDeleteTask: (taskId: string) => void;
}

export default function ChatThreads({ tasks, selectedTaskId, onSelectTask, onNewThread, onDeleteTask }: ChatThreadsProps) {
  const handleDelete = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      onDeleteTask(taskId);
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-3 border-b border-gray-200 bg-white">
        <button
          onClick={onNewThread}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-12 px-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium mb-1">No conversations yet</p>
              <p className="text-xs">Click "New Thread" to start</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`relative group rounded-lg transition-all cursor-pointer ${
                  selectedTaskId === task.id
                    ? 'bg-white border-2 border-primary-500 shadow-md'
                    : 'bg-white border border-gray-200 hover:border-primary-300 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => onSelectTask(task.id)}
                  className="w-full text-left p-3 pr-10"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <MessageCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      selectedTaskId === task.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                        {truncateText(task.task)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 ml-6">
                    <span>{format(new Date(task.timestamp), 'MMM d, HH:mm')}</span>
                  </div>
                </button>
                <button
                  onClick={(e) => handleDelete(e, task.id)}
                  className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

