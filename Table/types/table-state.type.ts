// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '~/components/Table/models/table-column.model'

export type ITableColumnState = Pick<
  TableColumn,
  | 'field'
  | 'width'
  | 'sort'
  | 'sortOrder'
  | 'hidden'
  | 'frozen'
  | 'semiFrozen'
  | 'dataType'
  | 'originalWidth'
  | 'filterField'
  | 'local'
> & {
  filters: Pick<
    TableColumn['filters'][number],
    | 'id'
    | 'field'
    | 'comparator'
    | 'value'
    | 'nonInteractive'
    | 'dataType'
    | 'filterField'
  >[]
}

export type ITableState = {
  includeDeleted: boolean
  schema?: string
  page?: number
  pageSize?: number
  columns?: ITableColumnState[]
  queryBuilder?: IQueryBuilderRow[]

  // Project specific
  // Contains any other data that might be needed for the table
  meta?: Record<string, any>
}
