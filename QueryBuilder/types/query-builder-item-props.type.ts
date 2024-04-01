// Types
import type { IItem } from '~/libs/App/types/item.type'
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'
import type { IQueryBuilderRowProps } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

export type IQueryBuilderItem<T = IItem> = {
  id: string
  path: string
  field: ObjectKey<T>
  filterField?: ObjectKey<T>
  comparator: ComparatorEnum
  value?: any
  isNotDraggable?: boolean
  isNotDragOverable?: boolean
  dataType?: ExtendedDataType

  /**
   * The original object (reference)
   */
  ref?: T
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

  /**
   * When true, the add button is not shown
   */
  noAdd?: boolean

  /**
   * When true, the remove button is not shown
   */
  noRemove?: boolean

  /**
   * We can provide our own function for removing the item
   */
  removeFnc?: (item: IQueryBuilderItem) => void
}
