/**
 * We can prevent the drag if we return `false` from this function.
 */
export type DragStartFnc<T = IItem> = (payload: { el: HTMLElement, item: T }) => boolean | void
