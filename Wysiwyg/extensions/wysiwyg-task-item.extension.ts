import TaskItem, { type TaskItemOptions } from '@tiptap/extension-task-item'

/**
 * TaskItem https://tiptap.dev/api/nodes/task-item
 */
export function WysiwygTaskItem(
  options?: Partial<TaskItemOptions>,
) {
  return TaskItem.configure({
    nested: true,

    ...options,
  })
}
