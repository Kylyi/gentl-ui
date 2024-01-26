// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

export type IQueryBuilderProps = {
  /**
   * Whether the query builder is editable
   */
  editable?: boolean

  /**
   * The columns of the table
   */
  columns: TableColumn<any>[]

  /**
   * The actual items
   */
  items: IQueryBuilderRow[]

  /**
   * Whether to initialize the query builder with and empty group
   */
  noInitialization?: boolean
}
