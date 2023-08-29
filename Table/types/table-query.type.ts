import { config } from 'config'

// Types
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

export type ITableOrderBy = { field: string; direction: 'asc' | 'desc' }
export type ISelect = Record<string, boolean | Record<string, boolean>>

export type ITableFilterItem = Pick<
  IQueryBuilderItem,
  'field' | 'value' | 'comparator'
>

export type ITableFilterGroup = Pick<
  IQueryBuilderGroup,
  'isGroup' | 'condition'
> & {
  children: ITableFilterItem[]
}

export type ITableFilterRow = ITableFilterItem | ITableFilterGroup

export type ITableQuery = {
  queryBuilder?: IQueryBuilderRow[]
  columnFilters?: ITableFilterItem[]
  filters?: ITableFilterRow[]
  orderBy?: ITableOrderBy[]
  search?: string
  take?: number
  skip?: number
  select?: string[]
  includeDeleted?: boolean
  count?: boolean // Whether to also fetch the total count of items
  fetchMore?: {
    rowKey: string
    $key: number | string
  }
}

export type ITableDataFetchFncInput = {
  /**
   * The table query object with all the filters, sorting and everything else
   * in the object-like structure
   */
  tableQuery: ITableQuery

  /**
   * Same as the `tableQuery` but with the `alwaysSelected` columns included
   * Note: Used for actual data fetching
   */
  fetchTableQuery: ITableQuery

  /**
   * The query parameters for the actual fetch query
   * Note: Used for navigation
   */
  queryParams: ReturnType<typeof config.table.getQuery>

  /**
   * Same idea as `queryParams` but with the `alwaysSelected` columns included
   * Note: Used for actual data fetching
   */
  fetchQueryParams: ReturnType<typeof config.table.getQuery>

  /**
   * We can also inject our own keys to this object
   */
  [key: string]: any
}
