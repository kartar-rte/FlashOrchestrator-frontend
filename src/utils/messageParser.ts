/**
 * Parse and clean messages for user-friendly display
 */

export interface ParsedMessage {
  userQuestion: string;
  fullContent: string;
  hasInstructions: boolean;
  instructions?: string;
}

/**
 * Extract clean user question from task tags
 */
export function parseTaskMessage(content: string): ParsedMessage {
  // Extract text between <task> tags
  const taskMatch = content.match(/<task>\s*(.*?)\s*<task_instructions>/s);
  const userQuestion = taskMatch ? taskMatch[1].trim() : content;

  // Check if there are instructions
  const hasInstructions = content.includes('<task_instructions>');
  
  // Extract instructions if present
  let instructions = '';
  if (hasInstructions) {
    const instructionsMatch = content.match(/<task_instructions>(.*?)<\/task_instructions>/s);
    instructions = instructionsMatch ? instructionsMatch[1].trim() : '';
  }

  return {
    userQuestion: cleanText(userQuestion),
    fullContent: content,
    hasInstructions,
    instructions,
  };
}

/**
 * Clean text by removing extra whitespace and formatting
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove ALL HTML/XML tags
    .trim();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Check if message contains technical details
 */
export function hasTechnicalDetails(content: string): boolean {
  return content.includes('<task_instructions>') || 
         content.includes('<environment_details>') ||
         content.includes('# Visible Files') ||
         content.includes('# Current Mode');
}

/**
 * Sanitize content for safe rendering in ReactMarkdown
 * Removes XML tags that React doesn't recognize
 */
export function sanitizeForMarkdown(content: string): string {
  return content
    .replace(/<task>/g, '**Task:**\n')
    .replace(/<\/task>/g, '\n')
    .replace(/<task_instructions>[\s\S]*?<\/task_instructions>/g, '') // Remove instructions block
    .replace(/<environment_details>[\s\S]*?<\/environment_details>/g, '') // Remove environment block
    .replace(/<slug>|<\/slug>/g, '')
    .replace(/<name>|<\/name>/g, '')
    .replace(/<model>|<\/model>/g, '')
    .replace(/<[^>]+>/g, ''); // Remove any other XML tags
}
