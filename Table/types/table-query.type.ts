import { config } from 'config'

// Types
import type { IQueryBuilderGroup } from 'components/QueryBuilder/types/query-builder-group-props.type'
import type { IQueryBuilderItem } from 'components/QueryBuilder/types/query-builder-item-props.type'
import type { IQueryBuilderRow } from 'components/QueryBuilder/types/query-builder-row-props.type'

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
  filter?: ITableFilterRow[]
  orderBy?: ITableOrderBy[]
  search?: string
  take?: number
  skip?: number
  select?: string[]
  includeDeleted?: boolean
}

export type ITableDataFetchFncInput = {
  queryParams: ReturnType<typeof config.table.getQuery>
  tableQuery: ITableQuery
}
