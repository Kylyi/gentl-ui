import { TableColumn } from '~/components/Table/models/table-column.model'

type ITableColumnState = Pick<
  TableColumn,
  'field' | 'width' | 'comparator' | 'compareValue' | 'sort' | 'sortOrder'
>

export type ITableState = {
  includeDeleted: boolean
  page: number
  pageSize: number
  layout?: string // should be prefixed with `table-layout-`
  columns: ITableColumnState[]
}
