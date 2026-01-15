import { useState } from 'react';
import { ChevronDown, ChevronRight, MessageCircle, Bot, Info } from 'lucide-react';
import { parseTaskMessage, truncateText, sanitizeForMarkdown } from '../utils/messageParser';
import ReactMarkdown from 'react-markdown';

interface CleanMessageDisplayProps {
  content: string;
  type: 'user' | 'agent';
  timestamp?: number;
}

export default function CleanMessageDisplay({ content, type, timestamp }: CleanMessageDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const parsed = parseTaskMessage(content);
  const isUser = type === 'user';

  return (
    <div className={`mb-4 ${isUser ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}>
      {/* Main Message Card */}
      <div className={`rounded-lg p-4 ${
        isUser 
          ? 'bg-primary-600 text-white' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <div className={`flex-shrink-0 ${isUser ? 'text-white' : 'text-primary-600'}`}>
            {isUser ? <MessageCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium mb-1 ${isUser ? 'text-white' : 'text-gray-900'}`}>
              {isUser ? 'You' : 'AI Assistant'}
            </div>
            {timestamp && (
              <div className={`text-xs ${isUser ? 'text-primary-100' : 'text-gray-500'}`}>
                {new Date(timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Clean Message Content */}
        <div className={`text-sm ${isUser ? 'text-white' : 'text-gray-800'}`}>
          {isUser && parsed.hasInstructions ? (
            // For user messages with instructions, show clean question
            <div className="whitespace-pre-wrap">{parsed.userQuestion}</div>
          ) : (
            // For agent messages or simple user messages, sanitize and show content
            <ReactMarkdown className="prose prose-sm max-w-none">
              {sanitizeForMarkdown(content)}
            </ReactMarkdown>
          )}
        </div>

        {/* Show Details Button (only for messages with technical details) */}
        {parsed.hasInstructions && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`mt-3 flex items-center gap-2 text-xs font-medium ${
              isUser ? 'text-primary-100 hover:text-white' : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {showDetails ? 'Hide Details' : 'Show Technical Details'}
          </button>
        )}
      </div>

      {/* Expandable Technical Details */}
      {showDetails && parsed.hasInstructions && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Technical Details</span>
          </div>
          
          {/* Instructions Section */}
          <div className="space-y-2">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-800"
            >
              {showInstructions ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Task Instructions
            </button>
            
            {showInstructions && parsed.instructions && (
              <div className="ml-5 p-3 bg-white border border-gray-200 rounded text-xs text-gray-600 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                {parsed.instructions}
              </div>
            )}
          </div>

          {/* Full Raw Content */}
          <details className="mt-3">
            <summary className="text-xs font-medium text-gray-600 hover:text-gray-800 cursor-pointer">
              View Raw Content
            </summary>
            <div className="mt-2 p-3 bg-white border border-gray-200 rounded text-xs text-gray-600 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
              {parsed.fullContent}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
