# Orchestrator Visualization Format Instructions

## Overview
When completing tasks, the orchestrator should return results in a structured JSON format that allows mixing markdown text with visualizations (charts, tables, heatmaps) in sequential order.

## JSON Format Specification

```json
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
```

## Instruction Text for Orchestrator

Copy and include this instruction when creating tasks:

---

**IMPORTANT: When you complete the task, you MUST return your final result in the following structured JSON format that allows mixing markdown text with visualizations:**

```json
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
```

**Rules:**
1. Always include `"format": "structured_result"` at the top level
2. Use `"content"` as an array of blocks in the order you want them displayed
3. Each block must have a `"type"` field
4. For markdown blocks: use `type: "markdown"` and provide `"content"` as a markdown string
5. For tables: use `type: "table"`, provide `"data"` array and `"columns"` array
6. For charts: use `type: "chart"`, specify `"chartType"` ("bar", "line", "pie", "area", "scatter"), provide `"data"` with x and y fields, specify `"xAxis"` and `"yAxis"`
7. For heatmaps: use `type: "heatmap"`, provide `"data"` with x, y, and value fields, specify `"xAxis"` and `"yAxis"`
8. You can mix markdown and visualizations in any order - e.g., paragraph, chart, paragraph, table, paragraph
9. Return ONLY valid JSON - no markdown code blocks, no extra text before/after
10. Use markdown blocks to provide context before and after visualizations

**Example - Simple text only:**
```json
{
  "format": "structured_result",
  "content": [
    {
      "type": "markdown",
      "content": "# Task Complete\n\nI have successfully completed the task. Here's what was done:\n\n1. First step\n2. Second step\n\n## Summary\nThe changes are ready."
    }
  ]
}
```

**Example - Text with embedded chart:**
```json
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
```

**Example - Complex mixed content:**
```json
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
```

---

## Format Details

### Content Block Types

#### Markdown Block
```json
{
  "type": "markdown",
  "content": "# Heading\n\nParagraph text with **bold** and *italic*."
}
```

#### Table Block
```json
{
  "type": "table",
  "data": [
    {"column1": "value1", "column2": "value2"},
    {"column1": "value3", "column2": "value4"}
  ],
  "columns": ["column1", "column2"],
  "title": "Optional Table Title",
  "description": "Optional description"
}
```

#### Chart Block
```json
{
  "type": "chart",
  "chartType": "bar",
  "data": [
    {"x": "Jan", "y": 100},
    {"x": "Feb", "y": 150}
  ],
  "xAxis": "x",
  "yAxis": "y",
  "title": "Optional Chart Title",
  "description": "Optional description"
}
```

**Chart Types:**
- `"bar"` - Bar chart
- `"line"` - Line chart
- `"pie"` - Pie chart
- `"area"` - Area chart
- `"scatter"` - Scatter plot

#### Heatmap Block
```json
{
  "type": "heatmap",
  "data": [
    {"x": "Region A", "y": "Q1", "value": 0.85},
    {"x": "Region A", "y": "Q2", "value": 0.92}
  ],
  "xAxis": "x",
  "yAxis": "y",
  "title": "Optional Heatmap Title",
  "description": "Optional description"
}
```

## Backward Compatibility

The UI will automatically handle:
- Structured JSON format (new format) - parsed and rendered as sequential blocks
- Plain text/markdown - automatically wrapped in a markdown block
- Invalid JSON - treated as plain text/markdown

No changes needed to existing orchestrator code - just include the instruction text when creating tasks.
