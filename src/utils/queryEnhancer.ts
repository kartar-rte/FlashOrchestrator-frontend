export interface QueryEnhancementConfig {
  enabled: boolean;
  instructions: string; // Custom instructions for this use case
  databaseEnabled: boolean;
  fileSearchEnabled: boolean;
  skipIfInMemory: boolean; // Only skip tools if answer already in conversation
}

const STORAGE_KEY = 'query_enhancement_config'; // Legacy - kept for backward compatibility

const DEFAULT_INSTRUCTIONS = `You MUST follow these steps in order:
 
1. DATABASE EXPLORATION (REQUIRED):

   - Use get_database_schema to discover available tables and their structure

   - Identify which tables contain data relevant to the user's query

   - Use create_sql_query to generate SQL queries based on the user's question

   - CRITICAL: Immediately after create_sql_query returns a SQL query, you MUST call execute_sql_query with that query to get the actual data. Do NOT stop after creating the query - you must execute it.

   - Extract key metrics, numbers, and structured insights from the database results
 
2. FILE EXPLORATION (REQUIRED):

   - Use codebase_search to find relevant documents, articles, or content related to the query

   - Use read_file to read the content of relevant files

   - Extract insights, best practices, and contextual information from the files
 
3. SYNTHESIS (REQUIRED):

   - Combine insights from both database (structured data) and files (unstructured content)

   - Frame your response based on actual data from the database

   - Enhance your response with context and best practices from the files

   - Present a comprehensive answer that leverages both data sources
 
IMPORTANT:

- DO NOT skip these steps unless the answer is already present in the conversation history

- Always use tools even if you think you know the answer - the data may have changed

- If database or file search fails, note it in your response but continue with available sources

- The workflow is: get_database_schema → create_sql_query → execute_sql_query (IMMEDIATELY) → codebase_search → read_file → synthesize
 
IMPORTANT: When you complete the task, you MUST return your final result in the following structured JSON format that allows mixing markdown text with visualizations:
 
{

  "format": "structured_result",

  "content": [

    {

      "type": "markdown",

      "content": "Your markdown text here. Use this for explanations, summaries, and narrative content."

    },

    {

      "type": "table",

      "data": [{"col1": "val1", "col2": "val2"}],

      "columns": ["col1", "col2"],

      "title": "Optional title"

    },

    {

      "type": "chart",

      "chartType": "bar",

      "data": [{"x": "label", "y": 100}],

      "xAxis": "x",

      "yAxis": "y",

      "title": "Optional title"

    },

    {

      "type": "heatmap",

      "data": [{"x": "A", "y": "1", "value": 10}],

      "xAxis": "x",

      "yAxis": "y",

      "title": "Optional title"

    },

    {

      "type": "markdown",

      "content": "More markdown content after the visualization..."

    }

  ]

}
 
Rules:

1. Always include "format": "structured_result" at the top level

2. Use "content" as an array of blocks in the order you want them displayed

3. Each block must have a "type" field

4. For markdown blocks: use type "markdown" and provide "content" as a markdown string

5. For tables: use type "table", provide "data" array and "columns" array

6. For charts: use type "chart", specify "chartType" ("bar", "line", "pie", "area", "scatter"), provide "data" with x and y fields, specify "xAxis" and "yAxis"

7. For heatmaps: use type "heatmap", provide "data" with x, y, and value fields, specify "xAxis" and "yAxis"

8. You can mix markdown and visualizations in any order - e.g., paragraph, chart, paragraph, table, paragraph

9. Return ONLY valid JSON - no markdown code blocks, no extra text before/after

10. Use markdown blocks to provide context before and after visualizations
 
Example - Simple text only:

{

  "format": "structured_result",

  "content": [

    {

      "type": "markdown",

      "content": "# Task Complete\n\nI have successfully completed the task. Here's what was done:\n\n1. First step\n2. Second step\n\n## Summary\nThe changes are ready."

    }

  ]

}
 
Example - Text with embedded chart:

{

  "format": "structured_result",

  "content": [

    {

      "type": "markdown",

      "content": "# Monthly Sales Analysis\n\nThe following chart shows our sales trends over the past quarter:"

    },

    {

      "type": "chart",

      "chartType": "bar",

      "data": [

        {"month": "Jan", "sales": 1200},

        {"month": "Feb", "sales": 1500},

        {"month": "Mar", "sales": 1800}

      ],

      "xAxis": "month",

      "yAxis": "sales",

      "title": "Monthly Sales"

    },

    {

      "type": "markdown",

      "content": "As we can see, sales have been steadily increasing. The growth rate is approximately 25% month-over-month."

    }

  ]

}
 
Example - Complex mixed content:

{

  "format": "structured_result",

  "content": [

    {

      "type": "markdown",

      "content": "# Analysis Report\n\nThis report analyzes the performance metrics across different dimensions."

    },

    {

      "type": "chart",

      "chartType": "line",

      "data": [

        {"period": "Q1", "revenue": 50000},

        {"period": "Q2", "revenue": 60000},

        {"period": "Q3", "revenue": 75000}

      ],

      "xAxis": "period",

      "yAxis": "revenue",

      "title": "Revenue Trend"

    },

    {

      "type": "markdown",

      "content": "The revenue trend shows consistent growth. Let's break down the details by product category:"

    },

    {

      "type": "table",

      "data": [

        {"Category": "Electronics", "Q1": 20000, "Q2": 24000, "Q3": 30000},

        {"Category": "Clothing", "Q1": 15000, "Q2": 18000, "Q3": 22000},

        {"Category": "Food", "Q1": 15000, "Q2": 18000, "Q3": 23000}

      ],

      "columns": ["Category", "Q1", "Q2", "Q3"],

      "title": "Revenue by Category"

    },

    {

      "type": "markdown",

      "content": "## Key Insights\n\n1. Electronics category shows the strongest growth\n2. All categories are trending upward\n3. Q3 performance exceeded expectations"

    },

    {

      "type": "heatmap",

      "data": [

        {"x": "Electronics", "y": "Q1", "value": 0.8},

        {"x": "Electronics", "y": "Q2", "value": 0.85},

        {"x": "Electronics", "y": "Q3", "value": 0.92}

      ],

      "xAxis": "x",

      "yAxis": "y",

      "title": "Category Performance Heatmap"

    },

    {

      "type": "markdown",

      "content": "The heatmap visualization confirms the strong performance across all categories and quarters."

    }

  ]

}
 `;

export function loadEnhancementConfig(): QueryEnhancementConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        enabled: parsed.enabled ?? true,
        instructions: parsed.instructions ?? DEFAULT_INSTRUCTIONS,
        databaseEnabled: parsed.databaseEnabled ?? true,
        fileSearchEnabled: parsed.fileSearchEnabled ?? true,
        skipIfInMemory: parsed.skipIfInMemory ?? true,
      };
    }
  } catch (error) {
    console.error('Failed to load enhancement config:', error);
  }
  return {
    enabled: true,
    instructions: DEFAULT_INSTRUCTIONS,
    databaseEnabled: true,
    fileSearchEnabled: true,
    skipIfInMemory: true,
  };
}

export function saveEnhancementConfig(config: QueryEnhancementConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save enhancement config:', error);
  }
}

/**
 * Check if the answer might already be in conversation history
 * This is a simple heuristic - in practice, the LLM should check its own memory
 */
function mightHaveAnswerInMemory(userQuery: string): boolean {
  // This is a placeholder - in practice, you'd check conversation history
  // For now, we'll let the LLM decide based on the instruction
  return false;
}

import { getUseCaseById, getSelectedUseCase } from './useCaseManager';

/**
 * Enhance user query with instruction-driven approach
 * @param userQuery - The user's query
 * @param useCaseId - Optional use case ID to use. If not provided, uses selected use case
 */
export function enhanceQuery(
  userQuery: string,
  useCaseId?: string
): string {
  // Load use case
  const useCase = useCaseId 
    ? (getUseCaseById(useCaseId) || getSelectedUseCase())
    : getSelectedUseCase();
  
  // Convert use case to config format
  const config: QueryEnhancementConfig = {
    enabled: true, // Always enabled when using use cases
    instructions: useCase.instructions,
    databaseEnabled: useCase.databaseEnabled,
    fileSearchEnabled: useCase.fileSearchEnabled,
    skipIfInMemory: useCase.skipIfInMemory,
  };
  
  return enhanceQueryWithConfig(userQuery, config);
}

/**
 * Enhance user query with explicit config (legacy support)
 */
export function enhanceQueryWithConfig(
  userQuery: string,
  config: QueryEnhancementConfig
): string {
  // If enhancement is disabled, return original
  if (!config.enabled) {
    return userQuery;
  }

  // Check if we should skip (answer in memory)
  if (config.skipIfInMemory && mightHaveAnswerInMemory(userQuery)) {
    // Still add a reminder to verify with tools
    return `${userQuery}

<reminder>
While you may have discussed this topic before, please verify current data using database and file tools to ensure accuracy.
</reminder>`;
  }

  // Build enhancement based on enabled sources
  const sourceInstructions: string[] = [];
  
  if (config.databaseEnabled) {
    sourceInstructions.push(`
DATABASE TOOLS (REQUIRED):
- get_database_schema: Discover available tables
- create_sql_query: Generate SQL based on user's question
- execute_sql_query: Retrieve actual data`);
  }

  if (config.fileSearchEnabled) {
    sourceInstructions.push(`
FILE TOOLS (REQUIRED):
- search_files: Find relevant documents
- read_file: Read file content`);
  }

  const enhancement = `

<task_instructions>
${config.instructions}

${sourceInstructions.join('\n')}

WORKFLOW (MUST FOLLOW IN ORDER):
1. Start with get_database_schema to understand available data
2. Use create_sql_query to generate SQL based on the user's question
3. IMMEDIATELY call execute_sql_query with the SQL query from step 2 - do not wait or skip this step
4. Use search_files to find relevant documents
5. Read relevant files using read_file
6. Synthesize all findings into a comprehensive response

CRITICAL: After create_sql_query returns a SQL query, you MUST immediately call execute_sql_query in the next tool call. The SQL query is useless without execution - you need the actual data to answer the user's question.

DO NOT provide answers without using these tools first, unless the information is already present in the conversation history above.
</task_instructions>`;

  return userQuery + enhancement;
}

/**
 * Create custom instructions for specific use cases
 */
export const USE_CASE_TEMPLATES = {
  dataAnalysis: {
    name: 'Data Analysis',
    instructions: `You are analyzing data to answer the user's question. You MUST:
1. Use get_database_schema to discover available tables
2. Use create_sql_query to generate SQL queries, then IMMEDIATELY execute them with execute_sql_query
3. Search files for relevant analysis frameworks and methodologies
4. Combine quantitative data with qualitative insights`,
  },
  strategicPlanning: {
    name: 'Strategic Planning',
    instructions: `You are helping with strategic planning. You MUST:
1. Use get_database_schema to discover available tables
2. Use create_sql_query to generate SQL queries, then IMMEDIATELY execute them with execute_sql_query
3. Search files for best practices, case studies, and strategic frameworks
4. Combine data-driven insights with expert recommendations`,
  },
  reporting: {
    name: 'Reporting',
    instructions: `You are creating a report. You MUST:
1. Use get_database_schema to discover available tables
2. Use create_sql_query to generate SQL queries, then IMMEDIATELY execute them with execute_sql_query
3. Search files for report templates, formatting guidelines, and context
4. Structure the report with data-backed findings and supporting documentation`,
  },
  research: {
    name: 'Research',
    instructions: `You are conducting research. You MUST:
1. Use get_database_schema to discover available tables
2. Use create_sql_query to generate SQL queries, then IMMEDIATELY execute them with execute_sql_query
3. Search files for research papers, articles, and documentation
4. Synthesize findings from both structured and unstructured sources`,
  },
};

