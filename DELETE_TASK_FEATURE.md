# Delete Task Feature

## Overview
Added the ability to delete chat threads from the sidebar history with a trash icon button.

## Changes Made

### Backend (FlashOrchestrator)

#### 1. StandaloneTaskProvider.ts
Added `deleteTask()` method that:
- Removes the task from history.json
- Deletes the task directory and all its files
- Handles errors gracefully

```typescript
async deleteTask(taskId: string): Promise<void>
```

#### 2. server/index.ts
Added DELETE endpoint:
```
DELETE /api/task/:taskId
```

Returns:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Frontend (UI)

#### 1. api.ts
Added `deleteTask()` method to API service:
```typescript
async deleteTask(taskId: string): Promise<{ success: boolean; message?: string; error?: string }>
```

#### 2. ChatThreads.tsx
- Added Trash2 icon import from lucide-react
- Added `onDeleteTask` prop
- Added delete button that appears on hover
- Delete button shows confirmation dialog before deleting
- Button positioned absolutely on the right side of each thread item
- Uses `stopPropagation()` to prevent selecting the task when clicking delete

UI Features:
- Delete button only visible on hover (opacity-0 group-hover:opacity-100)
- Red hover state for visual feedback
- Confirmation dialog before deletion
- Prevents task selection when clicking delete button

#### 3. LeftPanel.tsx
- Added `onDeleteTask` prop
- Passes the delete handler to ChatThreads component

#### 4. App.tsx
- Added `handleDeleteTask()` function that:
  - Calls the API to delete the task
  - Clears selection if deleted task was selected
  - Clears loaded history for the task
  - Clears use case mapping for the task
  - Refreshes the task list
  - Shows error alert if deletion fails
- Updated `handleDeleteChat()` to use the new delete handler
- Passes `onDeleteTask` to LeftPanel

## User Experience

1. **Hover to reveal**: Delete button appears when hovering over a chat thread
2. **Visual feedback**: Button turns red on hover
3. **Confirmation**: User must confirm deletion in a dialog
4. **Automatic cleanup**: 
   - If the deleted task was selected, selection is cleared
   - Task is removed from the list immediately
   - All associated data is cleaned up

## Technical Details

### What Gets Deleted
- Task entry from history.json
- Task directory: `.flashbuild/tasks/{taskId}/`
- All files in the task directory:
  - ui_messages.json
  - api_conversation_history.json
  - Any other task-related files

### Error Handling
- Backend errors are logged but don't crash the server
- Frontend shows an alert if deletion fails
- Uses `force: true` in `fs.rm()` to handle missing directories gracefully

## Testing
To test the feature:
1. Create a few chat threads
2. Hover over a thread in the sidebar
3. Click the trash icon that appears
4. Confirm the deletion
5. Verify the thread is removed from the list
6. Check that `.flashbuild/tasks/{taskId}` directory is deleted

## Future Enhancements
- Add undo functionality
- Add bulk delete option
- Add archive instead of delete
- Add export before delete option
