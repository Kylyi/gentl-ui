import { TaskList, type TaskListOptions } from '@tiptap/extension-task-list'

/**
 * TaskList https://tiptap.dev/api/nodes/task-list
 */
export function WysiwygTaskList(
  options?: Partial<TaskListOptions>,
) {
  return TaskList.configure({
    ...options,
  })
}
