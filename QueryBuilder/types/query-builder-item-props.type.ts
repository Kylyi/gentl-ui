// Types
import type { IQueryBuilderGroup } from 'components/QueryBuilder/types/query-builder-group-props.type'
import type { IQueryBuilderRowProps } from 'components/QueryBuilder/types/query-builder-row-props.type'

// Models
import { ComparatorEnum } from 'libs/App/data/enums/comparator.enum'

export type IQueryBuilderItem = {
  id: string
  path: string
  field: string
  comparator: ComparatorEnum
  value: any
}

export type IQueryBuilderItemProps = IQueryBuilderRowProps & {
  /**
   * The actual query builder row item
   */
  item: IQueryBuilderItem

  /**
   * The nested level
   */
  level: number

  /**
   * Whether the item is draggable
   */
  noDraggable?: boolean

  /**
   * Parent of the current item
   */
  parent?: IQueryBuilderGroup

  /**
   * Whether the current item is the first child of its parent
   */
  isFirstChild?: boolean

  /**
   * Whether the current item is the last child of its parent
   */
  isLastChild?: boolean
}
