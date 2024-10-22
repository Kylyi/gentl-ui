import type { IListItem } from '~/components/List/types/list-item.type'

export type IListDraggedItem = {
  row: IListItem
  pos: { x: number | null, y: number | null }
  dropIndicatorPos?: {
    x: number | null
    y: number | null
    width: number | null
  }
  newPathIsGroup?: boolean
  direction?: 'below' | 'above'
  newPath?: string
  path: string

  target?: IListItem
}
