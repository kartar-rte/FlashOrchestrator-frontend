import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Loader2, Trash2, FileText, Search, Code, Database, Zap, CheckCircle2, ChevronDown, Clock, Circle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { OrchestratorEvent, WebSocketMessage } from '../hooks/useWebSocket';
import { format } from 'date-fns';
import { loadUseCases, getSelectedUseCaseId, setSelectedUseCaseId, getUseCaseById } from '../utils/useCaseManager';
import SmartVisualization from './SmartVisualization';

interface RightPanelProps {
  onSendMessage: (message: string, useCaseId?: string) => void;
  taskId: string | null;
  status?: any;
  onDeleteChat?: () => void;
  events?: OrchestratorEvent[];
  messages?: WebSocketMessage[];
  toolUses?: Record<string, any[]>;
  logs?: Record<string, any[]>;
  taskUseCaseId?: string;
  onUseCaseChange?: (useCaseId: string) => void;
  loadedHistory?: Record<string, WebSocketMessage[]>;
  loadingHistory?: Record<string, boolean>;
}

interface ChatItem {
  id: string;
  type: 'user' | 'agent' | 'progress' | 'tool' | 'log' | 'final';
  content: string;
  timestamp: number;
  icon?: React.ReactNode;
  toolName?: string;
  hasVisualization?: boolean;
}

export default function RightPanel({
  onSendMessage,
  taskId,
  status,
  onDeleteChat,
  events = [],
  messages = [],
  toolUses = {},
  logs = {},
  taskUseCaseId,
  onUseCaseChange,
  loadedHistory = {},
  loadingHistory = {},
}: RightPanelProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedUseCaseId, setSelectedUseCaseIdState] = useState<string>(taskUseCaseId || getSelectedUseCaseId());
  const [showUseCaseDropdown, setShowUseCaseDropdown] = useState(false);
  const [isTaskProgressExpanded, setIsTaskProgressExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // #region agent log
  useEffect(() => {
    if (taskId) {
//       fetch('http://127.0.0.1:7245/ingest/866b450a-a0a7-4005-991c-f22cacb94ff5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RightPanel.tsx:52',message:'RightPanel props received',data:{taskId,hasLoadedHistory:loadedHistory[taskId] !== undefined,loadedHistoryCount:loadedHistory[taskId]?.length || 0,isLoading:loadingHistory[taskId] === true,messagesCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    }
  }, [taskId, loadedHistory, loadingHistory, messages.length]);
  // #endregion

  const useCases = loadUseCases();
  const currentUseCase = getUseCaseById(selectedUseCaseId) || useCases[0];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Update selected use case when task changes or taskUseCaseId prop changes
  useEffect(() => {
    if (taskUseCaseId) {
      setSelectedUseCaseIdState(taskUseCaseId);
    } else {
      setSelectedUseCaseIdState(getSelectedUseCaseId());
    }
  }, [taskId, taskUseCaseId]);

  const handleUseCaseSelect = (useCaseId: string) => {
    setSelectedUseCaseIdState(useCaseId);
    setSelectedUseCaseId(useCaseId);
    if (onUseCaseChange) {
      onUseCaseChange(useCaseId);
    }
    setShowUseCaseDropdown(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const messageToSend = message.trim();
    setIsSending(true);
    try {
      await onSendMessage(messageToSend, selectedUseCaseId);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Error is already handled in App.tsx, but we keep the message in the input
      // so user can retry
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper function to format tool name into human-readable action
  const formatToolAction = (toolName: string, input?: any): string => {
    const toolNameLower = toolName.toLowerCase();
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input || {});

    // File operations
    if (toolNameLower.includes('read') || toolNameLower.includes('file')) {
      if (input?.path || input?.file) {
        const path = input.path || input.file;
        return `Reading file: ${path}`;
      }
      return 'Reading files...';
    }
    if (toolNameLower.includes('write') || toolNameLower.includes('create')) {
      if (input?.path || input?.file) {
        const path = input.path || input.file;
        return `Writing to file: ${path}`;
      }
      return 'Writing files...';
    }
    if (toolNameLower.includes('search') || toolNameLower.includes('find')) {
      if (input?.query || input?.pattern) {
        return `Searching for: ${input.query || input.pattern}`;
      }
      return 'Searching files...';
    }
    if (toolNameLower.includes('list') || toolNameLower.includes('directory')) {
      if (input?.path || input?.directory) {
        return `Listing directory: ${input.path || input.directory}`;
      }
      return 'Listing files...';
    }

    // Code operations
    if (toolNameLower.includes('code') || toolNameLower.includes('analyze')) {
      return 'Analyzing code...';
    }
    if (toolNameLower.includes('query') || toolNameLower.includes('execute')) {
      return 'Executing query...';
    }

    // Generic formatting
    const formatted = toolName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();

    return `${formatted}...`;
  };

  // Helper function to check if a log should be filtered out (internal/system logs)
  const shouldFilterLog = (logMessage: string): boolean => {
    const lowerMessage = logMessage.toLowerCase();
    // Filter out internal system logs
    const filterPatterns = [
      'checkpointservice',
      'checkpoint service',
      'shadow git',
      'initshadowgit',
      'savecheckpoint',
      'task#getcheckpointservice',
      '[task#',
      'checkpoint_saved',
      'currentcheckpoint',
      'git check',
      'repo per task',
    ];
    return filterPatterns.some(pattern => lowerMessage.includes(pattern));
  };

  // Helper function to format log messages
  const formatLogMessage = (log: any): string => {
    if (typeof log === 'string') return log;
    if (log.message) return log.message;
    if (log.text) return log.text;
    if (log.content) return log.content;
    if (log.level && log.message) return `[${log.level}] ${log.message}`;
    return JSON.stringify(log);
  };

  // Extract todo list from messages for unified task progress
  const taskProgress = useMemo(() => {
    if (!taskId) return null;
    
    const taskMessages = messages.filter((msg) => msg.taskId === taskId || !msg.taskId);
    
    // Find the most recent updateTodoList message
    // Check both tool messages and regular messages that might contain todo list updates
    for (let i = taskMessages.length - 1; i >= 0; i--) {
      const msg = taskMessages[i];
      const messageData = msg.data?.message || msg.data;
      
      // Check for tool message with updateTodoList
      if (messageData?.say === 'tool' && messageData?.text) {
        try {
          const toolData = JSON.parse(messageData.text);
          if (toolData.tool === 'updateTodoList' && toolData.todos) {
            return toolData.todos;
          }
        } catch (e) {
          // Not JSON, skip
        }
      }
      
      // Also check for text messages that might contain todo list in XML format
      if (messageData?.say === 'text' && messageData?.text) {
        try {
          // Look for <update_todo_list> XML tags
          const todoMatch = messageData.text.match(/<update_todo_list>[\s\S]*?<\/update_todo_list>/);
          if (todoMatch) {
            // Try to extract todos from the XML
            const todosMatch = messageData.text.match(/<todos>([\s\S]*?)<\/todos>/);
            if (todosMatch) {
              const todosText = todosMatch[1];
              // Parse markdown checklist format: [x], [ ], [-]
              const todoLines = todosText.split('\n').filter((line: string) => line.trim());
              const todos = todoLines.map((line: string, idx: number) => {
                const trimmed = line.trim();
                let status: 'pending' | 'in_progress' | 'completed' = 'pending';
                let content = trimmed;
                
                if (trimmed.startsWith('[x]')) {
                  status = 'completed';
                  content = trimmed.substring(3).trim();
                } else if (trimmed.startsWith('[-]')) {
                  status = 'in_progress';
                  content = trimmed.substring(3).trim();
                } else if (trimmed.startsWith('[ ]')) {
                  status = 'pending';
                  content = trimmed.substring(3).trim();
                }
                
                return {
                  id: `todo-${idx}`,
                  content: content,
                  status: status,
                };
              });
              
              if (todos.length > 0) {
                return todos;
              }
            }
          }
        } catch (e) {
          // Not XML format, skip
        }
      }
    }
    
    return null;
  }, [taskId, messages]);

  // Create a unified chat timeline from messages, tool uses, logs, and events
  const chatItems = useMemo(() => {
    // #region agent log
//     fetch('http://127.0.0.1:7245/ingest/866b450a-a0a7-4005-991c-f22cacb94ff5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RightPanel.tsx:268',message:'chatItems computation started',data:{taskId,totalMessages:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    const items: ChatItem[] = [];
    const currentTaskId = taskId || 'unknown';

    // Get tool uses for this task
    const taskToolUses = toolUses[currentTaskId] || [];

    // Get logs for this task
    const taskLogs = logs[currentTaskId] || [];

    // Filter events for this task
    const taskEvents = taskId
      ? events.filter((e) => e.data?.taskId === taskId || !e.data?.taskId)
      : events;

    // Filter messages for this task - BUT keep completion_result to extract final response
    const taskMessages = taskId
      ? messages.filter((msg) => {
        if (msg.taskId !== taskId && msg.taskId) return false;
        return true; // Don't filter completion_result yet - we need to extract response from it
      })
      : messages;
    
    // #region agent log
//     fetch('http://127.0.0.1:7245/ingest/866b450a-a0a7-4005-991c-f22cacb94ff5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RightPanel.tsx:285',message:'Messages filtered for task',data:{taskId,taskMessagesCount:taskMessages.length,totalMessages:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Separate completion_result messages to extract final response
    // Check multiple possible structures: msg.data.message.say, msg.data.message.ask
    const completionMessages = taskMessages.filter((msg) => {
      if (msg.data?.message?.say === 'completion_result') return true;
      if (msg.data?.message?.ask === 'completion_result') return true;
      if (msg.data?.say === 'completion_result' || msg.type === 'completion_result') return true;
      if (msg.data?.ask === 'completion_result') return true;
      return false;
    });

    // Filter out completion_result from regular messages processing
    const regularMessages = taskMessages.filter((msg) =>
      msg.data?.say !== 'completion_result' && msg.type !== 'completion_result'
    );

    // Add user messages (taskMessage type - these are user inputs)
    // User messages typically have msg.data.message.type === "say" and msg.data.message.say === "text" 
    // OR they're the initial message without a nested message structure
    regularMessages.forEach((msg, idx) => {
      if (msg.type === 'taskMessage') {
        // Check if this is a user input (initial query) - typically the first message or one without say/ask
        const messageType = msg.data?.message?.type;
        const messageSay = msg.data?.message?.say;
        const messageAsk = msg.data?.message?.ask;

        // User messages are typically the first message or messages that don't have say/ask structure
        // OR messages where the action indicates it's a user input
        const isUserMessage = !messageSay && !messageAsk && msg.data?.message?.text && idx < 5;

        if (isUserMessage) {
          const content = msg.data?.message?.text || msg.data?.text || msg.data?.content || '';
          if (content && typeof content === 'string' && content.trim()) {
            items.push({
              id: `user-${idx}-${msg.timestamp}`,
              type: 'user',
              content: content,
              timestamp: msg.timestamp,
            });
          }
        }
      }
    });

    // If we have user messages but no other content yet, add a processing indicator
    // BUT only if we don't have completion messages or agent responses yet
    // Check more thoroughly for agent content
    const hasAgentContent = completionMessages.length > 0 ||
      regularMessages.some(m => {
        if (m.type !== 'taskMessage') return true;
        const msgData = m.data?.message || m.data;
        return msgData?.say === 'text' || msgData?.type === 'say';
      }) ||
      items.some(item => item.type === 'agent' || item.type === 'tool' || item.type === 'log');
    if (items.length > 0 && items.every(item => item.type === 'user') && !hasAgentContent) {
      const lastUserMessage = items[items.length - 1];
      if (lastUserMessage.type === 'user') {
        items.push({
          id: `processing-${lastUserMessage.timestamp + 1}`,
          type: 'progress',
          content: 'Processing your request...',
          timestamp: lastUserMessage.timestamp + 1,
          icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
        });
      }
    }

    // Add tool uses as progress indicators
    taskToolUses.forEach((toolUse, idx) => {
      const toolName = toolUse.name || toolUse.tool || 'Unknown Tool';
      const action = formatToolAction(toolName, toolUse.input || toolUse.arguments);
      items.push({
        id: `tool-${idx}-${toolUse.timestamp || Date.now()}`,
        type: 'tool',
        content: action,
        timestamp: toolUse.timestamp || Date.now(),
        toolName: toolName,
      });
    });

    // Add logs as progress updates (only user-facing logs, filter out internal system logs)
    taskLogs.forEach((log, idx) => {
      const logMessage = formatLogMessage(log);
      if (logMessage && logMessage.trim() && !shouldFilterLog(logMessage)) {
        // Only show logs that seem user-facing (not technical system logs)
        // Skip logs that are just technical details
        items.push({
          id: `log-${idx}-${log.timestamp || Date.now()}`,
          type: 'log',
          content: logMessage,
          timestamp: log.timestamp || Date.now(),
        });
      }
    });

    // Add agent messages (non-user messages with content, including 'message' type from agent)
    regularMessages.forEach((msg, idx) => {
      if (msg.type === 'taskMessage') {
        // Extract agent responses from taskMessage entries
        // Handle both wrapped format { action: "created", message: {...} } and direct format
        const messageData = msg.data?.message || msg.data;
        const messageSay = messageData?.say;
        const messageText = messageData?.text;
        const messageType = messageData?.type;

        // Skip if this is completion_result (handled separately) or internal system messages
        if (messageSay === 'completion_result' || messageSay === 'checkpoint_saved' ||
          messageData?.ask === 'completion_result') {
          return;
        }

        // Agent responses have say === "text" and contain the reasoning/response
        // Also handle cases where type === "say" and say === "text"
        if ((messageSay === 'text' || (messageType === 'say' && messageSay === 'text')) &&
          messageText && typeof messageText === 'string' && messageText.trim()) {
          // Filter out internal system messages
          if (!shouldFilterLog(messageText)) {
            // Don't filter out XML-like content (like <update_todo_list>) - these are valid agent responses
            // Only filter out actual JSON objects/arrays
            const trimmedText = messageText.trim();
            const isJsonObject = trimmedText.startsWith('{') && trimmedText.endsWith('}');
            const isJsonArray = trimmedText.startsWith('[') && trimmedText.endsWith(']');

            if (!isJsonObject && !isJsonArray) {
              // Use a more unique ID to prevent duplicates
              const uniqueId = `agent-${msg.timestamp}-${idx}-${messageText.substring(0, 20).replace(/\s/g, '')}`;

              // Check if we already added this message to prevent duplicates
              const alreadyAdded = items.some(item =>
                item.type === 'agent' &&
                item.content === messageText &&
                Math.abs(item.timestamp - msg.timestamp) < 1000 // Within 1 second
              );

              if (!alreadyAdded) {
                items.push({
                  id: uniqueId,
                  type: 'agent',
                  content: messageText,
                  timestamp: msg.timestamp,
                });
              }
            }
          }
        }
      } else if (msg.type !== 'taskMessage') {
        // Handle non-taskMessage types (legacy support)
        if (msg.type === 'checkpoint_saved' || msg.data?.say === 'checkpoint_saved') {
          return;
        }

        let content = '';
        if (msg.data?.say && typeof msg.data.say === 'string') {
          content = msg.data.say;
        } else if (msg.data?.text && typeof msg.data.text === 'string') {
          content = msg.data.text;
        } else if (msg.data?.message?.text && typeof msg.data.message.text === 'string') {
          content = msg.data.message.text;
        }

        if (content && typeof content === 'string' && content.trim() && !shouldFilterLog(content)) {
          const trimmedContent = content.trim();
          const isJsonObject = trimmedContent.startsWith('{') && trimmedContent.endsWith('}');
          const isJsonArray = trimmedContent.startsWith('[') && trimmedContent.endsWith(']');

          if (!isJsonObject && !isJsonArray && !content.includes('completion_result')) {
            // Use a more unique ID
            const uniqueId = `agent-legacy-${msg.timestamp}-${idx}`;

            // Check for duplicates
            const alreadyAdded = items.some(item =>
              item.type === 'agent' &&
              item.content === content &&
              Math.abs(item.timestamp - msg.timestamp) < 1000
            );

            if (!alreadyAdded) {
              items.push({
                id: uniqueId,
                type: 'agent',
                content: content,
                timestamp: msg.timestamp,
              });
            }
          }
        }
      }
    });

    // Process completion_result messages to extract final response with visualization
    // Deduplicate: only process the first completion message with text content
    let completionProcessed = false;
    for (const msg of completionMessages) {
      if (completionProcessed) break; // Only process the first one

      // Extract final response from completion_result
      // Based on logs: msg.data.message.say === "completion_result" and msg.data.message.text contains the response
      let finalResponse = '';

      // Primary structure: msg.data.message.text when msg.data.message.say === "completion_result"
      if (msg.data?.message?.text && typeof msg.data.message.text === 'string' && msg.data.message.text.trim()) {
        finalResponse = msg.data.message.text;
      } else if (msg.data?.text && typeof msg.data.text === 'string' && msg.data.text.trim()) {
        finalResponse = msg.data.text;
      } else if (msg.data?.message?.content && typeof msg.data.message.content === 'string' && msg.data.message.content.trim()) {
        finalResponse = msg.data.message.content;
      } else if (msg.data?.content && typeof msg.data.content === 'string' && msg.data.content.trim()) {
        finalResponse = msg.data.content;
      }

      // Add final response if we found one - mark it as 'final' type so we can render with visualization
      if (finalResponse && finalResponse.trim()) {
        items.push({
          id: `completion-${msg.timestamp}`,
          type: 'final',
          content: finalResponse,
          timestamp: msg.timestamp,
          hasVisualization: true, // Mark that this has visualization data
        });
        completionProcessed = true;
      } else if (!completionProcessed) {
        // Only add fallback if we haven't processed any completion yet
        items.push({
          id: `completion-${msg.timestamp}`,
          type: 'final',
          content: 'Task completed successfully.',
          timestamp: msg.timestamp,
          hasVisualization: false,
        });
        completionProcessed = true;
      }
    }

    // Add task started event (only if we have no other items yet)
    const startedEvent = taskEvents.find(e => e.type === 'taskStarted');
    if (startedEvent && items.length === 0) {
      items.push({
        id: `event-started-${startedEvent.timestamp}`,
        type: 'progress',
        content: 'Processing your request...',
        timestamp: startedEvent.timestamp,
        icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
      });
    }

    // Add task completed event (only if we don't already have a completion message)
    const completedEvent = taskEvents.find(e => e.type === 'taskCompleted');
    if (completedEvent && !completionProcessed) {
      items.push({
        id: `event-completed-${completedEvent.timestamp}`,
        type: 'final',
        content: 'Task completed',
        timestamp: completedEvent.timestamp,
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        hasVisualization: false,
      });
    }

    // Remove "Processing" indicators if we have agent responses or completion
    const hasAgentResponses = items.some(item => item.type === 'agent' || item.type === 'final');
    const filteredItems = hasAgentResponses
      ? items.filter(item => !(item.type === 'progress' && item.content === 'Processing your request...'))
      : items;

    // Sort by timestamp, but prioritize certain types
    filteredItems.sort((a, b) => {
      // First sort by timestamp
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      // If same timestamp, prioritize: user > agent > tool > log > progress > final
      const priority: Record<ChatItem['type'], number> = {
        user: 1,
        agent: 2,
        tool: 3,
        log: 4,
        progress: 5,
        final: 6,
      };
      return (priority[a.type] || 99) - (priority[b.type] || 99);
    });

    // #region agent log
//     fetch('http://127.0.0.1:7245/ingest/866b450a-a0a7-4005-991c-f22cacb94ff5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RightPanel.tsx:520',message:'chatItems computed',data:{taskId,totalItems:filteredItems.length,userItems:filteredItems.filter(i => i.type === 'user').length,agentItems:filteredItems.filter(i => i.type === 'agent').length,finalItems:filteredItems.filter(i => i.type === 'final').length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    return filteredItems;
  }, [taskId, messages, toolUses, logs, events, taskProgress]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatItems]);

  return (
    <div className="relative bg-white flex flex-col border-r border-gray-200 flex-1" ref={panelRef}>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Agent Chat</h2>
          {taskId && onDeleteChat && (
            <button
              onClick={onDeleteChat}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {taskId && (
          <div className="mt-2">
            <div className="text-xs text-gray-500">Task: {taskId.substring(0, 8)}...</div>
            {status && (
              <div className="text-xs text-gray-500 mt-1">
                Status: <span className="font-medium">{status.status || 'active'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {!taskId ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Start a new conversation by typing a message below.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Ask the orchestrator to perform tasks</p>
              <p>• Request code changes or analysis</p>
              <p>• Get help with your workspace</p>
            </div>
          </div>
        ) : (
          <>
            {chatItems.length === 0 ? (
              (() => {
                const isLoading = loadingHistory[taskId] === true;
                const hasLoadedHistory = taskId && loadedHistory[taskId] !== undefined;
                const hasWebSocketMessages = messages.some(msg => msg.taskId === taskId);
                
                // #region agent log
//                 fetch('http://127.0.0.1:7245/ingest/866b450a-a0a7-4005-991c-f22cacb94ff5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RightPanel.tsx:637',message:'Empty chatItems - determining UI state',data:{taskId,isLoading,hasLoadedHistory,hasWebSocketMessages,loadedHistoryCount:loadedHistory[taskId]?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                // #endregion
                
                // If we're loading history, show loading state
                if (isLoading) {
                  // #region agent log
//                   fetch('http://127.0.0.1:7245/ingest/866b450a-a0a7-4005-991c-f22cacb94ff5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RightPanel.tsx:644',message:'Showing loading state',data:{taskId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                  // #endregion
                  return (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        Loading conversation history...
                      </p>
                    </div>
                  );
                }
                
                // If history was loaded but is empty, show appropriate message
                if (hasLoadedHistory && !hasWebSocketMessages) {
                  // #region agent log
//                   fetch('http://127.0.0.1:7245/ingest/866b450a-a0a7-4005-991c-f22cacb94ff5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RightPanel.tsx:655',message:'Showing empty history message',data:{taskId,loadedHistoryCount:loadedHistory[taskId]?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                  // #endregion
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">
                        No conversation history found for this task.
                      </p>
                      <p className="text-xs text-gray-400">
                        The conversation history may not have been saved or the task may be new.
                      </p>
                    </div>
                  );
                }
                
                // Otherwise, show processing state (for active tasks)
                // #region agent log
//                 fetch('http://127.0.0.1:7245/ingest/866b450a-a0a7-4005-991c-f22cacb94ff5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RightPanel.tsx:670',message:'Showing processing state',data:{taskId,hasLoadedHistory,hasWebSocketMessages},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                // #endregion
                return (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Processing your request...
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      The agent is working on your query
                    </p>
                  </div>
                );
              })()
            ) : (
              <div className="space-y-3">
                {chatItems.map((item) => (
                  <ChatItemBubble key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Unified Task Progress Section */}
      {taskId && taskProgress && taskProgress.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setIsTaskProgressExpanded(!isTaskProgressExpanded)}
            className="w-full p-3 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="text-left">
              <h3 className="text-sm font-semibold text-gray-900">Task Progress</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {taskProgress.filter((t: any) => t.status === 'completed').length}/{taskProgress.length} completed
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${isTaskProgressExpanded ? '' : 'transform -rotate-90'
                }`}
            />
          </button>
          {isTaskProgressExpanded && (
            <div className="overflow-y-auto p-3 space-y-2" style={{ maxHeight: '200px' }}>
              {taskProgress.map((todo: any) => {
                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case 'completed':
                      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
                    case 'in_progress':
                      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
                    default:
                      return <Circle className="w-4 h-4 text-gray-400" />;
                  }
                };
                
                return (
                  <div key={todo.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors">
                    {getStatusIcon(todo.status)}
                    <span className={`text-sm flex-1 ${todo.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700'
                      }`}>
                      {todo.content}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {/* Use Case Selector */}
        <div className="mb-2 relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Use Case
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUseCaseDropdown(!showUseCaseDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="text-gray-700">{currentUseCase?.name || 'Select Use Case'}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUseCaseDropdown ? 'transform rotate-180' : ''}`} />
            </button>
            {showUseCaseDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUseCaseDropdown(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {useCases.map((useCase) => (
                    <button
                      key={useCase.id}
                      type="button"
                      onClick={() => handleUseCaseSelect(useCase.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedUseCaseId === useCase.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                    >
                      <div className="font-medium">{useCase.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {useCase.instructions.substring(0, 60)}...
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatItemBubble({ item }: { item: ChatItem }) {
  const getToolIcon = (toolName?: string) => {
    if (!toolName) return <Zap className="w-4 h-4" />;
    const name = toolName.toLowerCase();
    if (name.includes('read') || name.includes('file')) return <FileText className="w-4 h-4" />;
    if (name.includes('search') || name.includes('find')) return <Search className="w-4 h-4" />;
    if (name.includes('code') || name.includes('analyze')) return <Code className="w-4 h-4" />;
    if (name.includes('query') || name.includes('database')) return <Database className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  if (item.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-primary-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
          <p className="text-sm whitespace-pre-wrap">{item.content}</p>
          <span className="text-xs text-primary-200 mt-1 block">
            {format(new Date(item.timestamp), 'HH:mm:ss')}
          </span>
        </div>
      </div>
    );
  }

  if (item.type === 'tool' || item.type === 'progress') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        {item.icon || (item.type === 'tool' && item.toolName ? getToolIcon(item.toolName) : <Loader2 className="w-4 h-4 animate-spin" />)}
        <span>{item.content}</span>
        <span className="text-xs text-gray-400 ml-auto">
          {format(new Date(item.timestamp), 'HH:mm:ss')}
        </span>
      </div>
    );
  }

  if (item.type === 'log') {
    return (
      <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
        <span className="flex-1">{item.content}</span>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {format(new Date(item.timestamp), 'HH:mm:ss')}
        </span>
      </div>
    );
  }

  if (item.type === 'final') {
    // Check if this has visualization data
    const hasVisualization = item.hasVisualization && item.content && item.content.length > 50;
    
    // If it's just a simple completion notification, show it compactly
    if (!hasVisualization && (item.content === 'Task completed' || item.content === 'Task completed successfully.')) {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {item.icon || <CheckCircle2 className="w-4 h-4" />}
          <span>{item.content}</span>
          <span className="text-xs text-green-600 ml-auto">
            {format(new Date(item.timestamp), 'HH:mm:ss')}
          </span>
        </div>
      );
    }
    
    // Full final answer with visualization
    return (
      <div className="flex justify-start w-full">
        <div className="bg-white rounded-lg border-2 border-green-300 shadow-lg max-w-[95%] w-full">
          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-sm text-gray-900">Final Answer</span>
            <span className="text-xs text-gray-500 ml-auto">
              {format(new Date(item.timestamp), 'HH:mm:ss')}
            </span>
          </div>
          <div className="p-5 space-y-5">
            {/* Text content */}
            <div className="prose prose-sm max-w-none overflow-hidden">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="overflow-x-auto w-full" style={{ maxWidth: '100%' }}>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          wrapLines={true}
                          wrapLongLines={true}
                          customStyle={{
                            margin: 0,
                            maxWidth: '100%',
                            overflowX: 'auto',
                            fontSize: '0.75rem',
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ node, ...props }) => (
                    <pre className="overflow-x-auto w-full" style={{ maxWidth: '100%' }} {...props} />
                  ),
                }}
              >
                {item.content}
              </ReactMarkdown>
            </div>
            
            {/* Visualization if available */}
            {hasVisualization && (
              <div className="border-t border-gray-200 pt-5">
                <SmartVisualization data={item.content} autoAnalyze={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Agent message (default)
  return (
    <div className="flex justify-start">
      <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 max-w-[85%] overflow-hidden">
        <div className="prose prose-sm max-w-none overflow-hidden">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="overflow-x-auto w-full" style={{ maxWidth: '100%' }}>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      wrapLines={true}
                      wrapLongLines={true}
                      customStyle={{
                        margin: 0,
                        maxWidth: '100%',
                        overflowX: 'auto',
                        fontSize: '0.75rem',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              pre: ({ node, ...props }) => (
                <pre className="overflow-x-auto w-full" style={{ maxWidth: '100%' }} {...props} />
              ),
            }}
          >
            {item.content}
          </ReactMarkdown>
        </div>
        <span className="text-xs text-gray-400 mt-2 block">
          {format(new Date(item.timestamp), 'HH:mm:ss')}
        </span>
      </div>
    </div>
  );
}

