import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { VisualizationConfig } from '../services/visualizationService';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface VisualizationProps {
  config: VisualizationConfig;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Table Component
export function TableVisualization({ config }: VisualizationProps) {
  const { data = [], columns = [], title } = config;

  if (!data || data.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <p className="text-sm text-gray-500">No data to display</p>
      </div>
    );
  }

  // Auto-detect columns if not provided
  const tableColumns = columns.length > 0 
    ? columns 
    : (data[0] ? Object.keys(data[0]) : []);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {title && (
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableColumns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 100).map((row: any, rowIdx: number) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {tableColumns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
                  >
                    {row[col] !== null && row[col] !== undefined
                      ? String(row[col])
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 100 && (
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
            Showing first 100 of {data.length} rows
          </div>
        )}
      </div>
    </div>
  );
}

// Chart Component
export function ChartVisualization({ config }: VisualizationProps) {
  const { data = [], chartType = 'bar', xAxis, yAxis, title } = config;

  if (!data || data.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <p className="text-sm text-gray-500">No data to display</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!xAxis || !yAxis) {
      // Auto-detect axes from first data item
      const keys = Object.keys(data[0] || {});
      if (keys.length >= 2) {
        return data.map((item: any) => ({
          name: String(item[keys[0]] || ''),
          value: Number(item[keys[1]]) || 0,
          ...item,
        }));
      }
      return data;
    }

    return data.map((item: any) => ({
      name: String(item[xAxis] || ''),
      value: Number(item[yAxis]) || 0,
      ...item,
    }));
  }, [data, xAxis, yAxis]);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0088FE" />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Scatter dataKey="value" fill="#0088FE" />
          </ScatterChart>
        );
      default:
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {title && (
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Heatmap Component
export function HeatmapVisualization({ config }: VisualizationProps) {
  const { data = [], xAxis, yAxis, title } = config;

  if (!data || data.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <p className="text-sm text-gray-500">No data to display</p>
      </div>
    );
  }

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    if (!xAxis || !yAxis) {
      const keys = Object.keys(data[0] || {});
      if (keys.length >= 3) {
        // Assume third key is the value
        return data.map((item: any) => ({
          x: String(item[keys[0]] || ''),
          y: String(item[keys[1]] || ''),
          value: Number(item[keys[2]]) || 0,
        }));
      }
      return [];
    }

    return data.map((item: any) => ({
      x: String(item[xAxis] || ''),
      y: String(item[yAxis] || ''),
      value: Number(item[Object.keys(item).find(k => k !== xAxis && k !== yAxis) || 'value']) || 0,
    }));
  }, [data, xAxis, yAxis]);

  // Get unique x and y values
  const xValues = Array.from(new Set(heatmapData.map(d => d.x))).sort();
  const yValues = Array.from(new Set(heatmapData.map(d => d.y))).sort();

  // Create matrix
  const matrix = yValues.map(y => 
    xValues.map(x => {
      const item = heatmapData.find(d => d.x === x && d.y === y);
      return item ? item.value : 0;
    })
  );

  // Find min and max for color scaling
  const allValues = heatmapData.map(d => d.value);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;

  const getColor = (value: number) => {
    const ratio = (value - minValue) / range;
    // Blue to red gradient
    const r = Math.round(255 * ratio);
    const b = Math.round(255 * (1 - ratio));
    return `rgb(${r}, 100, ${b})`;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {title && (
        <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-2 py-2 text-xs font-medium text-gray-500"></th>
                {xValues.map(x => (
                  <th key={x} className="px-2 py-2 text-xs font-medium text-gray-500 text-center">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yValues.map((y, yIdx) => (
                <tr key={y}>
                  <td className="px-2 py-2 text-xs font-medium text-gray-700">{y}</td>
                  {xValues.map((x, xIdx) => {
                    const value = matrix[yIdx][xIdx];
                    return (
                      <td
                        key={x}
                        className="px-2 py-2 text-center text-xs"
                        style={{
                          backgroundColor: getColor(value),
                          color: value > (minValue + maxValue) / 2 ? 'white' : 'black',
                        }}
                        title={`${x} × ${y}: ${value}`}
                      >
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: getColor(minValue) }}></div>
            <span>Min: {minValue.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: getColor(maxValue) }}></div>
            <span>Max: {maxValue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Text Component (with markdown support)
export function TextVisualization({ config }: VisualizationProps) {
  const { rawData, title, description } = config;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {title && (
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <div className="prose prose-sm max-w-none break-words">
          <ReactMarkdown 
            rehypePlugins={[rehypeRaw]}
            components={{
              pre: ({ node, ...props }) => (
                <pre className="overflow-x-auto max-w-full" {...props} />
              ),
              code: ({ node, inline, ...props }) => (
                <code className={inline ? '' : 'block overflow-x-auto max-w-full'} {...props} />
              ),
            }}
          >
            {rawData || String(config.data || '')}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

