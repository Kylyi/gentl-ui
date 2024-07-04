export type IDndState = {
  isDragging?: boolean
  draggedEl?: HTMLElement | null
  draggedElInitialIdx?: number
  draggedContainerEl?: HTMLElement | null
  targetContainerEl?: HTMLElement | null
  toIdx?: number

  extraData?: IItem
}
