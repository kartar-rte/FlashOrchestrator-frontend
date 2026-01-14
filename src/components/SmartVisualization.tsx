import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { StructuredContentBlock } from '../services/visualizationService';
import {
  TableVisualization,
  ChartVisualization,
  HeatmapVisualization,
  TextVisualization,
} from './VisualizationComponents';

interface SmartVisualizationProps {
  data: string;
  autoAnalyze?: boolean;
}

export default function SmartVisualization({ data, autoAnalyze = true }: SmartVisualizationProps) {
  const [contentBlocks, setContentBlocks] = useState<StructuredContentBlock[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isStructured, setIsStructured] = useState(false);

  useEffect(() => {
    if (autoAnalyze && data) {
      parseData();
    }
  }, [data, autoAnalyze]);

  const parseData = () => {
    try {
      // Try to parse as structured JSON
      const parsed = JSON.parse(data);
      
      if (parsed.format === 'structured_result' && Array.isArray(parsed.content)) {
        // Valid structured format
        setContentBlocks(parsed.content);
        setIsStructured(true);
      } else {
        // Not structured format, treat as plain markdown
        setContentBlocks([{
          type: 'markdown',
          content: data
        }]);
        setIsStructured(false);
      }
    } catch (e) {
      // Not JSON or invalid JSON - treat as plain markdown
      setContentBlocks([{
        type: 'markdown',
        content: data
      }]);
      setIsStructured(false);
    }
  };

  const renderBlock = (block: StructuredContentBlock, index: number) => {
    switch (block.type) {
      case 'markdown':
        return (
          <TextVisualization
            key={`block-${index}`}
            config={{ rawData: block.content || '' }}
          />
        );
      
      case 'table':
        return (
          <TableVisualization
            key={`block-${index}`}
            config={{
              visualization: 'table',
              data: block.data || [],
              columns: block.columns,
              title: block.title,
              description: block.description,
            }}
          />
        );
      
      case 'chart':
        return (
          <ChartVisualization
            key={`block-${index}`}
            config={{
              visualization: 'chart',
              chartType: block.chartType || 'bar',
              data: block.data || [],
              xAxis: block.xAxis,
              yAxis: block.yAxis,
              title: block.title,
              description: block.description,
            }}
          />
        );
      
      case 'heatmap':
        return (
          <HeatmapVisualization
            key={`block-${index}`}
            config={{
              visualization: 'heatmap',
              data: block.data || [],
              xAxis: block.xAxis,
              yAxis: block.yAxis,
              title: block.title,
              description: block.description,
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-gray-600">
            {isStructured ? (
              <>Structured Result ({contentBlocks.length} block{contentBlocks.length !== 1 ? 's' : ''})</>
            ) : (
              <>Text Content</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {showOriginal ? 'Hide' : 'Show'} Original
          </button>
        </div>
      </div>
      
      {/* Render all content blocks in sequence */}
      <div className="space-y-4">
        {contentBlocks.map((block, index) => renderBlock(block, index))}
      </div>
      
      {showOriginal && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
            <h4 className="text-xs font-medium text-gray-700">Original Data</h4>
          </div>
          <div className="p-4">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
              {data}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

