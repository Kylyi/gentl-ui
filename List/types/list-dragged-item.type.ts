export type IListDraggedItem = {
  row: IItem
  pos: { x: number | null; y: number | null }
  dropIndicatorPos?: {
    x: number | null
    y: number | null
    width: number | null
  }
  newPathIsGroup?: boolean
  dropDirection?: 'below' | 'above'
  newPath?: string
  path: string

  target?: IItem
}
