import { klona } from 'klona'
import { config } from '~/config'

// Types
import type { ITableState } from '~/components/Table/types/table-state.type'

export const TABLE_STATE_DEFAULT: ITableState = {
  includeDeleted: false,
  ...config.table.defaultPagination,
}

export function getTableStateDefault() {
  return klona(TABLE_STATE_DEFAULT)
}
