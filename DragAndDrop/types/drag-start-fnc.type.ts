// Types
import type { IDndState } from '~/components/DragAndDrop/types/drag-and-drop-state.type'

/**
 * We can prevent the drag if we return `false` from this function.
 */
export type DragStartFnc<T = IItem> = (payload: { el: HTMLElement, item: T, dndState: IDndState }) => boolean | void
