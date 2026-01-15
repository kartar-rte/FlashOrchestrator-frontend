import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { dummy_data } from '../App';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  taskId?: string;
}

export interface OrchestratorEvent {
  type: string;
  timestamp: number;
  data?: any;
}

export function useWebSocket(taskId: string | null) {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [toolUses, setToolUses] = useState<Record<string, any[]>>({});
  const [statusChanges, setStatusChanges] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<Record<string, any[]>>({});
  const [events, setEvents] = useState<OrchestratorEvent[]>([]);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const taskIdRef = useRef<string | null>(taskId);
  const isMountedRef = useRef(true);

  // Update taskId ref when it changes
  useEffect(() => {
    taskIdRef.current = taskId;
  }, [taskId]);

  useEffect(() => {
    isMountedRef.current = true;

    // Don't close existing connection if taskId changes - keep the same WebSocket
    // The WebSocket should remain open to receive all events
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Connection already exists and is open, just return
      return;
    }

    // Only create new connection if we don't have one or it's closed
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CLOSED || wsRef.current.readyState === WebSocket.CLOSING)) {
      // Clean up closed connection
      wsRef.current = null;
    }

    const ws = apiService.createWebSocket((eventType, data) => {
      // Use ref to get current taskId value
      const currentTaskId = taskIdRef.current;
      const message: WebSocketMessage = {
        type: eventType,
        data,
        timestamp: Date.now(),
        taskId: data?.taskId || currentTaskId || undefined,
      };

      // Track all events for agent progression
      const event: OrchestratorEvent = {
        type: eventType,
        timestamp: Date.now(),
        data: data || message.data,
      };
      setEvents((prev) => [...prev, event]);

      switch (eventType) {
        case 'taskMessage':
        case 'message':
          setMessages((prev) => [...prev, message]);
          break;
        case 'toolUse':
          setToolUses((prev) => {
            const taskId = data?.taskId || message.taskId || 'unknown';
            return {
              ...prev,
              [taskId]: [...(prev[taskId] || []), data],
            };
          });
          break;
        case 'statusChange':
          if (data?.taskId) {
            setStatusChanges((prev) => ({
              ...prev,
              [data.taskId]: data,
            }));
          }
          break;
        case 'log':
          setLogs((prev) => {
            const taskId = data?.taskId || message.taskId || 'unknown';
            return {
              ...prev,
              [taskId]: [...(prev[taskId] || []), data],
            };
          });
          break;
        case 'taskCompleted':
        case 'taskStarted':
        case 'taskAborted':
        case 'taskPaused':
        case 'taskUnpaused':
        case 'taskSpawned':
        case 'taskActive':
        case 'taskInteractive':
        case 'taskResumable':
        case 'taskIdle':
          setStatusChanges((prev) => ({
            ...prev,
            [data?.taskId || taskIdRef.current || 'unknown']: { status: eventType, ...data },
          }));
          break;
      }
    });

    wsRef.current = ws;

    // Handle reconnection on close
    ws.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      // Only reconnect if it wasn't a normal closure, component is still mounted, and we don't have a pending reconnect
      if (event.code !== 1000 && isMountedRef.current && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          // Clear the ref to allow reconnection
          if (isMountedRef.current && wsRef.current && wsRef.current.readyState === WebSocket.CLOSED) {
            wsRef.current = null;
            // Trigger reconnection by updating state
            setReconnectTrigger((prev) => prev + 1);
          }
        }, 2000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      // Only cleanup timeout on taskId change - don't close WebSocket
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [reconnectTrigger]); // Reconnect when reconnectTrigger changes

  // Cleanup WebSocket only on component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, 'Component unmounting');
        } catch (error) {
          console.error('Error closing WebSocket:', error);
        }
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []); // Only runs on mount/unmount

  return {
    messages: getUniqueByTimestampAndTaskId(messages),
    toolUses,
    statusChanges,
    logs,
    events
  };
}


function getUniqueByTimestampAndTaskId(items: WebSocketMessage[]): WebSocketMessage[] {
  const seenTimestamps = new Set<number>()
  const seenMessageTs = new Set<number>()

  return items.filter(item => {
    const messageTs = item.data?.message?.ts

    // reject if timestamp already exists
    if (seenTimestamps.has(item.timestamp)) return false

    // reject if message.ts already exists
    if (messageTs !== undefined && seenMessageTs.has(messageTs)) return false
    // Remove Empty Text
    if (item.data.message.say === 'text' && item.data.message.text?.trim() === '') return false;

    // mark as seen
    seenTimestamps.add(item.timestamp)
    if (messageTs !== undefined) seenMessageTs.add(messageTs)

    return true
  })
}




