import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
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
    e.stopPropagation(); // Prevent selecting the task when clicking delete
    if (confirm('Are you sure you want to delete this chat thread?')) {
      onDeleteTask(taskId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-gray-200 bg-white">
        <button
          onClick={onNewThread}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              No chat threads yet. Click "New Thread" to start a conversation.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`relative group rounded-lg transition-colors ${
                  selectedTaskId === task.id
                    ? 'bg-primary-100 border border-primary-300'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => onSelectTask(task.id)}
                  className="w-full text-left p-3 pr-10"
                >
                  <div className="text-sm font-medium text-gray-900 truncate mb-1">
                    {task.task}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(task.timestamp), 'MMM d, HH:mm')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Mode: {task.mode}
                  </div>
                </button>
                <button
                  onClick={(e) => handleDelete(e, task.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete thread"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

