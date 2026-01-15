import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, Loader2, Code, FileText, Database, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SmartVisualization from './SmartVisualization';
import CleanMessageDisplay from './CleanMessageDisplay';
import { hasTechnicalDetails } from '../utils/messageParser';

interface MessageRendererProps {
    messages: any[];
}

interface TodoItem {
    id: string;
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
}

// Component for rendering todo list
function TodoListBlock({ todos }: { todos: TodoItem[] }) {
    const [isExpanded, setIsExpanded] = useState(true);

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
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm text-gray-900">Task Progress</span>
                </div>
                <span className="text-xs text-gray-500">
                    {todos.filter(t => t.status === 'completed').length}/{todos.length} completed
                </span>
            </button>

            {isExpanded && (
                <div className="p-4 space-y-2">
                    {todos.map((todo) => (
                        <div key={todo.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors">
                            {getStatusIcon(todo.status)}
                            <span className={`text-sm flex-1 ${todo.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700'
                                }`}>
                                {todo.content}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Component for rendering SQL queries
function SQLQueryBlock({ query }: { query: string }) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Database className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm text-gray-900">SQL Query Execution</span>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4">
                    <SyntaxHighlighter
                        language="sql"
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                        }}
                    >
                        {query}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    );
}

// Component for rendering search results
function SearchResultsBlock({ content }: { content: string }) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Parse search results from content
    const parseSearchResults = (text: string) => {
        try {
            // Extract the JSON part if it exists
            const jsonMatch = text.match(/\{.*\}/s);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed;
            }
        } catch (e) {
            // If parsing fails, return raw content
        }
        return { content: text };
    };

    const results = parseSearchResults(content);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Search className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm text-gray-900">Search Results</span>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 overflow-x-auto">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap break-words font-mono bg-gray-50 p-3 rounded border border-gray-200 max-h-96 overflow-y-auto max-w-full">
                        {typeof results === 'object' ? JSON.stringify(results, null, 2) : content}
                    </div>
                </div>
            )}
        </div>
    );
}

// Component for rendering text messages
function TextMessageBlock({ text }: { text: string }) {
    if (!text || text.trim() === '') return null;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="p-4 overflow-x-auto">
                <div className="prose prose-sm max-w-none break-words">
                    <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <div className="overflow-x-auto max-w-full">
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{
                                                maxWidth: '100%',
                                                overflowX: 'auto',
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
                                <pre className="overflow-x-auto max-w-full" {...props} />
                            ),
                        }}
                    >
                        {text}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

// Component for rendering completion result with smart visualization
function CompletionResultBlock({ text }: { text: string }) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-md">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-sm text-gray-900">Final Result (Smart Visualization)</span>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 bg-green-50">
                    <SmartVisualization data={text} autoAnalyze={true} />
                </div>
            )}
        </div>
    );
}

// Component for rendering generic tool messages
function ToolMessageBlock({ tool, content }: { tool: string; content: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getToolIcon = (toolName: string) => {
        if (toolName.includes('search')) return <Search className="w-4 h-4 text-orange-600" />;
        if (toolName.includes('database') || toolName.includes('sql')) return <Database className="w-4 h-4 text-orange-600" />;
        if (toolName.includes('file')) return <FileText className="w-4 h-4 text-orange-600" />;
        return <Code className="w-4 h-4 text-orange-600" />;
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {getToolIcon(tool)}
                    <span className="font-medium text-sm text-gray-900 capitalize">{tool.replace(/_/g, ' ')}</span>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono bg-gray-50 p-3 rounded border border-gray-200 max-h-96 overflow-y-auto max-w-full">
                        {typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content)}
                    </pre>
                </div>
            )}
        </div>
    );
}

// Main message renderer component
export default function MessageRenderer({ messages }: MessageRendererProps) {
    if (!messages || messages.length === 0) {
        return (
            <div className="text-center text-gray-400 py-8">
                <p className="text-sm">No messages yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {messages.map((msg, index) => {
                const messageData = msg.data?.message || msg.data;
                const sayType = messageData?.say;
                const askType = messageData?.ask;

                // Handle 'say' type messages
                if (sayType === 'tool') {
                    try {
                        const toolData = JSON.parse(messageData.text);

                        // Handle updateTodoList tool
                        if (toolData.tool === 'updateTodoList' && toolData.todos) {
                            return <TodoListBlock key={`${msg.timestamp}-${index}`} todos={toolData.todos} />;
                        }

                        // Handle searchFiles tool
                        if (toolData.tool === 'searchFiles') {
                            return <SearchResultsBlock key={`${msg.timestamp}-${index}`} content={toolData.content || messageData.text} />;
                        }

                        // Generic tool message
                        return <ToolMessageBlock key={`${msg.timestamp}-${index}`} tool={toolData.tool} content={toolData} />;
                    } catch (e) {
                        // If parsing fails, show as generic tool
                        return <ToolMessageBlock key={`${msg.timestamp}-${index}`} tool="unknown" content={messageData.text} />;
                    }
                }

                // Handle text messages
                if (sayType === 'text' && messageData.text) {
                    return <TextMessageBlock key={`${msg.timestamp}-${index}`} text={messageData.text} />;
                }

                // Handle completion result
                if (sayType === 'completion_result' && messageData.text) {
                    return <CompletionResultBlock key={`${msg.timestamp}-${index}`} text={messageData.text} />;
                }

                // Handle 'ask' type messages (commands, tools, etc.)
                if (askType === 'command' && messageData.text) {
                    // Extract SQL query if present
                    const sqlMatch = messageData.text.match(/SQL Query:\s*([\s\S]*)/);
                    if (sqlMatch) {
                        return <SQLQueryBlock key={`${msg.timestamp}-${index}`} query={sqlMatch[1].trim()} />;
                    }
                    return <TextMessageBlock key={`${msg.timestamp}-${index}`} text={messageData.text} />;
                }

                if (askType === 'tool' && messageData.text) {
                    try {
                        const toolData = JSON.parse(messageData.text);
                        if (toolData.tool === 'searchFiles') {
                            return <SearchResultsBlock key={`${msg.timestamp}-${index}`} content={toolData.content || messageData.text} />;
                        }
                        return <ToolMessageBlock key={`${msg.timestamp}-${index}`} tool={toolData.tool} content={toolData} />;
                    } catch (e) {
                        return <TextMessageBlock key={`${msg.timestamp}-${index}`} text={messageData.text} />;
                    }
                }

                // Default: don't render unknown message types
                return null;
            })}
        </div>
    );
}
