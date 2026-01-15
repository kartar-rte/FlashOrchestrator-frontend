import { useState, useCallback } from 'react';
import { apiService, Task } from '../services/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const refreshTasks = useCallback(async () => {
    try {
      // #region agent log
//       fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTasks.ts:7',message:'refreshTasks called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const response = await apiService.getTasks();
      // #region agent log
//       fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTasks.ts:10',message:'refreshTasks response received',data:{success:response.success,tasksCount:response.tasks?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if (response.success) {
        setTasks(response.tasks);
        // #region agent log
//         fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTasks.ts:12',message:'Tasks set in state',data:{tasksCount:response.tasks.length,taskIds:response.tasks.map(t=>t.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      // #region agent log
//       fetch('http://127.0.0.1:7244/ingest/903abbe4-f075-4569-9253-5f311dc90006',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTasks.ts:14',message:'refreshTasks error',data:{error:error?.message||String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  }, []);

  return { tasks, addTask, updateTask, refreshTasks };
}

