export type IDraggedItem<T = IItem> = {
  ref: T
  pos: { x: number, y: number }
}
