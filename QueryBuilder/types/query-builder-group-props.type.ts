// Types
import {
  IQueryBuilderRow,
  IQueryBuilderRowProps,
} from 'components/QueryBuilder/types/query-builder-row-props.type'

export type IQueryBuilderGroup = {
  id: string
  path: string
  condition: 'AND' | 'OR'
  children: IQueryBuilderRow[]
  isGroup: true
}

export type IQueryBuilderGroupProps = IQueryBuilderRowProps & {
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
}
