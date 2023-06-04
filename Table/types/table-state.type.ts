import { TableColumnState } from '@/components/Table/models/table-column-state.model'

export type ITableState = {
  includeDeleted: boolean
  page: number
  pageSize: number
  layout?: string // should be prefixed with `table-layout-`
  columns: TableColumnState[]
}
