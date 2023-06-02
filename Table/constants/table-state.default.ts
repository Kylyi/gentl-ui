import { ITableState } from '~/components/Table/types/table-state.type'

export const TABLE_STATE_DEFAULT: ITableState = {
  includeDeleted: false,
  page: 1,
  pageSize: 100,
  columns: [],
  layout: undefined,
}
