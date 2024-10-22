import { klona } from 'klona/full'

// Types
import type { ITableState } from '~/components/Table/types/table-state.type'

export const TABLE_STATE_DEFAULT: ITableState = {
  includeDeleted: false,
}

export function getTableStateDefault() {
  return klona(TABLE_STATE_DEFAULT)
}
