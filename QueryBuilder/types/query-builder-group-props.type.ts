// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type {
  IQueryBuilderRow,
  IQueryBuilderRowProps,
} from '~/components/QueryBuilder/types/query-builder-row-props.type'

export type IQueryBuilderGroup = {
  id: string
  path: string
  condition: 'AND' | 'OR'
  children: IQueryBuilderRow[]
  isGroup: true
  isNotDraggable?: boolean
  isNotDragOverable?: boolean
}

export type IQueryBuilderGroupProps = IQueryBuilderRowProps & {
  /**
   * Whether the item is editable
   */
  editable?: boolean

  /**
   * The actual query builder row item
   */
  item: IQueryBuilderGroup

  /**
   * The nested level
   */
  level: number

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

  /**
   * When true, the add button is not shown
   */
  noAdd?: boolean

  /**
   * When true, the condition may not be changed
   */
  noConditionChange?: boolean

  /**
   * We can provide our own function for removing the item
   */
  removeFnc?: (item: IQueryBuilderItem) => void
}
