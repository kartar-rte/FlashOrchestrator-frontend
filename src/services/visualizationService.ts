import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

export interface VisualizationConfig {
  visualization: 'text' | 'table' | 'chart' | 'heatmap';
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  data?: any[];
  columns?: string[];
  title?: string;
  description?: string;
}

export interface VisualizationResponse {
  visualization: 'text' | 'table' | 'chart' | 'heatmap';
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  data?: any[];
  columns?: string[];
  title?: string;
  description?: string;
  rawData?: any;
}

// New structured format for sequential content blocks
export interface StructuredContentBlock {
  type: 'markdown' | 'table' | 'chart' | 'heatmap';
  content?: string; // for markdown blocks
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  data?: any[];
  columns?: string[];
  xAxis?: string;
  yAxis?: string;
  title?: string;
  description?: string;
}

export interface StructuredResult {
  format: 'structured_result';
  content: StructuredContentBlock[];
}

class VisualizationService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Analyzes the final output from orchestrator and determines the best visualization format
   */
  async analyzeVisualization(data: string): Promise<VisualizationResponse> {
    try {
      // Try to call backend API endpoint first
      const response = await this.api.post('/api/visualize/analyze', { data });
      return response.data;
    } catch (error: any) {
      // If backend endpoint doesn't exist, use direct LLM call
      console.warn('Backend visualization endpoint not available, using direct LLM call');
      return this.analyzeWithDirectLLM(data);
    }
  }

  /**
   * Direct LLM call for visualization analysis
   * This uses the same API configuration as the orchestrator
   */
  private async analyzeWithDirectLLM(data: string): Promise<VisualizationResponse> {
    // Get API config from localStorage (same as orchestrator settings)
    const config = localStorage.getItem('orchestrator_config');
    if (!config) {
      console.warn('Orchestrator API configuration not found, using auto-detection');
      return this.autoDetectFormat(data);
    }

    let parsedConfig;
    try {
      parsedConfig = JSON.parse(config);
    } catch (e) {
      console.warn('Failed to parse orchestrator config, using auto-detection');
      return this.autoDetectFormat(data);
    }

    const { apiProvider, apiKey, apiBaseUrl, apiModelId } = parsedConfig;
    
    if (!apiProvider || !apiKey) {
      console.warn('API provider or key not configured, using auto-detection');
      return this.autoDetectFormat(data);
    }

    const prompt = `Analyze the following data and determine the best visualization format. Return ONLY valid JSON with the following structure:
{
  "visualization": "text" | "table" | "chart" | "heatmap",
  "chartType": "line" | "bar" | "pie" | "area" | "scatter" (only if visualization is "chart"),
  "xAxis": "column name" (only if chart or heatmap),
  "yAxis": "column name" (only if chart or heatmap),
  "data": [array of data objects] (if table, chart, or heatmap),
  "columns": ["col1", "col2"] (if table),
  "title": "Chart/Table title",
  "description": "Brief description of the visualization"
}

Rules:
- Use "text" if data is narrative or doesn't have structured data
- Use "table" if data has rows and columns (CSV-like, JSON arrays, etc.)
- Use "chart" if data has numeric values suitable for line/bar/pie/area/scatter charts
- Use "heatmap" if data has two dimensions suitable for heatmap visualization
- Extract and structure the data into the "data" field as an array of objects
- For charts, identify x and y axes from the data
- Return ONLY the JSON, no markdown, no code blocks

Data to analyze:
${data.substring(0, 8000)}`;

    try {
      let response;
      
      if (apiProvider === 'anthropic' || apiProvider === 'claude') {
        // Claude API
        const apiUrl = apiBaseUrl || 'https://api.anthropic.com/v1/messages';
        response = await axios.post(
          apiUrl,
          {
            model: apiModelId || 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
          }
        );
        
        const content = response.data.content[0].text;
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return { ...JSON.parse(jsonMatch[0]), rawData: data };
        }
      } else if (apiProvider === 'openai' || apiProvider === 'gpt') {
        // OpenAI API
        const apiUrl = apiBaseUrl || 'https://api.openai.com/v1/chat/completions';
        response = await axios.post(
          apiUrl,
          {
            model: apiModelId || 'gpt-4',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: { type: 'json_object' },
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content);
        return { ...parsed, rawData: data };
      }

      // Fallback: try to parse as JSON directly
      throw new Error('Unsupported API provider or failed to parse response');
    } catch (error: any) {
      console.error('Direct LLM call failed:', error);
      // Fallback: try to auto-detect format
      return this.autoDetectFormat(data);
    }
  }

  /**
   * Fallback: Auto-detect visualization format without LLM
   */
  private autoDetectFormat(data: string): VisualizationResponse {
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(data);
      
      if (Array.isArray(parsed)) {
        // Array of objects = table or chart
        if (parsed.length > 0 && typeof parsed[0] === 'object') {
          const keys = Object.keys(parsed[0]);
          const hasNumericValues = keys.some(key => 
            parsed.some((item: any) => typeof item[key] === 'number')
          );
          
          if (hasNumericValues && keys.length >= 2) {
            return {
              visualization: 'chart',
              chartType: 'bar',
              xAxis: keys[0],
              yAxis: keys[1],
              data: parsed,
              columns: keys,
              title: 'Data Visualization',
              rawData: data,
            };
          }
          
          return {
            visualization: 'table',
            data: parsed,
            columns: keys,
            title: 'Data Table',
            rawData: data,
          };
        }
      } else if (typeof parsed === 'object') {
        // Single object - check if it's table-like
        const values = Object.values(parsed);
        if (values.some(v => Array.isArray(v))) {
          return {
            visualization: 'table',
            data: parsed,
            columns: Object.keys(parsed),
            title: 'Data Table',
            rawData: data,
          };
        }
      }
    } catch (e) {
      // Not JSON
    }

    // Check if it's CSV-like
    const lines = data.split('\n').filter(l => l.trim());
    if (lines.length > 1) {
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(',') ? ',' : ' ');
      const headers = firstLine.split(delimiter).map(h => h.trim());
      
      if (headers.length > 1) {
        const rows = lines.slice(1).map(line => {
          const values = line.split(delimiter).map(v => v.trim());
          const row: any = {};
          headers.forEach((h, i) => {
            row[h] = values[i] || '';
          });
          return row;
        });
        
        return {
          visualization: 'table',
          data: rows,
          columns: headers,
          title: 'Data Table',
          rawData: data,
        };
      }
    }

    // Default to text
    return {
      visualization: 'text',
      title: 'Text Output',
      rawData: data,
    };
  }
}

export const visualizationService = new VisualizationService();

