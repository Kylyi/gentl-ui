import type { IDndState } from '~/components/DragAndDrop/types/drag-and-drop-state.type'
import type { IDraggedItem } from '~/components/DragAndDrop/types/dragged-item.type'

/**
 * We can prevent comitting the actual change to the data to handle some special cases
 * via returning `false` here
 *
 * For example, we might want to drop an item into a container, but before it's dropped
 * we want to confirm it via a Dialog. In that case, we should return `false` here,
 * handle the confirmation first, and then commit the change manually (via `commitDrag`)
 */
export type DragEndFnc<T> = (payload: {
  /**
   * The drag and drop state
   */
  dndState: IDndState

  /**
   * The dragged item
   */
  item: IDraggedItem<T>

  /**
   * The item that is preceeding the dragged item (in the DOM)
   */
  siblingItem?: T

  /**
   * The container the item was dragged from
   */
  from: IItem

  /**
   * The container the item was dragged to
   */
  to: IItem

  /**
   * The index the item was dragged to
   */
  toIdx: number

  /**
   * The direction the item was moved
   */
  moveDirection?: 'up' | 'down'

  /**
   * Cancels the drag, returning the item to its original position
   */
  cancelDrag: () => void
}) => boolean | undefined | Promise<boolean | undefined> | void
