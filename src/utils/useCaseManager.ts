export interface UseCase {
  id: string;
  name: string;
  instructions: string;
  databaseEnabled: boolean;
  fileSearchEnabled: boolean;
  skipIfInMemory: boolean;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'use_cases';
const SELECTED_USE_CASE_KEY = 'selected_use_case_id';

// Default use case - AIDO Queries
export const DEFAULT_USE_CASE: UseCase = {
  id: 'default-aido',
  name: 'AIDO Queries',
  instructions: `You MUST follow these steps in order:

1. DATABASE EXPLORATION (REQUIRED):
   - Use get_database_schema to discover available tables and their structure
   - Identify which tables contain data relevant to the user's query
   - Use create_sql_query to generate SQL queries based on the user's question
   - CRITICAL: Immediately after create_sql_query returns a SQL query, you MUST call execute_sql_query with that query to get the actual data. Do NOT stop after creating the query - you must execute it.
   - Extract key metrics, numbers, and structured insights from the database results

2. FILE EXPLORATION (REQUIRED):
   - Use search_files to find relevant documents, articles, or content related to the query
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
- The workflow is: get_database_schema → create_sql_query → execute_sql_query (IMMEDIATELY) → search_files → read_file → synthesize`,
  databaseEnabled: true,
  fileSearchEnabled: true,
  skipIfInMemory: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function loadUseCases(): UseCase[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure default use case exists
      const useCases = Array.isArray(parsed) ? parsed : [];
      const hasDefault = useCases.some(uc => uc.id === DEFAULT_USE_CASE.id);
      if (!hasDefault) {
        useCases.unshift(DEFAULT_USE_CASE);
        saveUseCases(useCases);
        return useCases;
      }
      return useCases;
    }
    // Initialize with default use case
    const initialUseCases = [DEFAULT_USE_CASE];
    saveUseCases(initialUseCases);
    return initialUseCases;
  } catch (error) {
    console.error('Failed to load use cases:', error);
    return [DEFAULT_USE_CASE];
  }
}

export function saveUseCases(useCases: UseCase[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(useCases));
  } catch (error) {
    console.error('Failed to save use cases:', error);
  }
}

export function createUseCase(useCase: Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'>): UseCase {
  const newUseCase: UseCase = {
    ...useCase,
    id: `use-case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const useCases = loadUseCases();
  useCases.push(newUseCase);
  saveUseCases(useCases);
  return newUseCase;
}

export function updateUseCase(id: string, updates: Partial<Omit<UseCase, 'id' | 'createdAt'>>): UseCase | null {
  const useCases = loadUseCases();
  const index = useCases.findIndex(uc => uc.id === id);
  if (index === -1) return null;
  
  useCases[index] = {
    ...useCases[index],
    ...updates,
    updatedAt: Date.now(),
  };
  saveUseCases(useCases);
  return useCases[index];
}

export function deleteUseCase(id: string): boolean {
  // Don't allow deleting the default use case
  if (id === DEFAULT_USE_CASE.id) {
    return false;
  }
  
  const useCases = loadUseCases();
  const filtered = useCases.filter(uc => uc.id !== id);
  if (filtered.length === useCases.length) return false;
  
  saveUseCases(filtered);
  
  // If deleted use case was selected, switch to default
  const selectedId = getSelectedUseCaseId();
  if (selectedId === id) {
    setSelectedUseCaseId(DEFAULT_USE_CASE.id);
  }
  
  return true;
}

export function getUseCaseById(id: string): UseCase | null {
  const useCases = loadUseCases();
  return useCases.find(uc => uc.id === id) || null;
}

export function getSelectedUseCaseId(): string {
  try {
    const stored = localStorage.getItem(SELECTED_USE_CASE_KEY);
    if (stored) {
      // Verify the use case still exists
      const useCases = loadUseCases();
      if (useCases.some(uc => uc.id === stored)) {
        return stored;
      }
    }
    // Default to default use case
    return DEFAULT_USE_CASE.id;
  } catch (error) {
    console.error('Failed to load selected use case:', error);
    return DEFAULT_USE_CASE.id;
  }
}

export function setSelectedUseCaseId(id: string): void {
  try {
    // Verify the use case exists
    const useCases = loadUseCases();
    if (useCases.some(uc => uc.id === id)) {
      localStorage.setItem(SELECTED_USE_CASE_KEY, id);
    }
  } catch (error) {
    console.error('Failed to save selected use case:', error);
  }
}

export function getSelectedUseCase(): UseCase {
  const selectedId = getSelectedUseCaseId();
  const useCase = getUseCaseById(selectedId);
  return useCase || DEFAULT_USE_CASE;
}

