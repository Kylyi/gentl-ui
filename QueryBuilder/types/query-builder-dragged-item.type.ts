// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

export type IQueryBuilderDraggedItem = {
  row: IQueryBuilderRow
  pos: { x: number | null; y: number | null }
  dropIndicatorPos?: {
    x: number | null
    y: number | null
    width: number | null
  }
  newPathIsGroup?: boolean
  dropDirection?: 'below' | 'above'
  newPath?: string
}
