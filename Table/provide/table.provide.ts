// Types
import type { ITableSelection } from 'components/Table/types/table-selection.type'
import type { ITableState } from '~/components/Table/types/table-state.type'
import type { ITableDataFetchFncInput } from 'components/Table/types/table-query.type'
import type { ITableLayout } from 'components/Table/types/table-layout.type'

// Models
import { TableColumn } from 'components/Table/models/table-column.model'

export const getTableStateKey: InjectionKey<() => ITableState> =
  Symbol('getTableStateKey')

export const tableIncludeDeletedKey: InjectionKey<Ref<boolean>> = Symbol(
  'tableIncludeDeleted'
)

export const tableRefreshKey: InjectionKey<() => void> =
  Symbol('refreshTableData')

export const tableColumnsKey: InjectionKey<Ref<TableColumn[]>> =
  Symbol('tableColumns')

export const tableNonHelpersColumnsKey: InjectionKey<Ref<TableColumn[]>> =
  Symbol('tableNonHelpersColumns')

export const tableQueryKey: InjectionKey<Ref<ITableDataFetchFncInput>> =
  Symbol('tableQuery')

export const tableStorageKey: InjectionKey<Ref<string>> =
  Symbol('tableStorageKey')

export const tableColumnsRecreateKey: InjectionKey<() => void> = Symbol(
  'tableColumnsRecreate'
)

export const tableRecreateQueryBuilderKey: InjectionKey<() => void> = Symbol(
  'tableRecreateQueryBuilder'
)

export const tableResizeKey: InjectionKey<() => void> = Symbol('tableResize')

// Metadata
export const tableLayoutsKey: InjectionKey<Ref<ITableLayout[]>> =
  Symbol('tableLayouts')

export const tableLayoutKey: InjectionKey<Ref<ITableLayout | undefined>> =
  Symbol('tableLayout')

// Selection
export const tableSelectRowKey: InjectionKey<(row: any) => void> =
  Symbol('tableSelectRow')

export const tableIsSelectedRowKey: InjectionKey<(row: any) => boolean> =
  Symbol('tableIsSelectedRow')

export const tableSelectionKey: InjectionKey<Ref<ITableSelection | undefined>> =
  Symbol('tableSelection')
