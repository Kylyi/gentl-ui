// Types
import type { ITableSelection } from '~/components/Table/types/table-selection.type'
import type { ITableDataFetchFncInput } from '~/components/Table/types/table-query.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Functions
import { useTableEditing } from '~/components/Table/functions/useTableEditing'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

export const getTableStorageKey: InjectionKey<() => string> =
  Symbol('getTableStorageKey')

export const tableIncludeDeletedKey: InjectionKey<Ref<boolean>> = Symbol(
  'tableIncludeDeleted'
)

export const tableRowsKey: InjectionKey<Ref<any[]>> = Symbol('tableRows')

export const tableRefreshKey: InjectionKey<(force?: boolean) => void> =
  Symbol('refreshTableData')

export const tableQueryBuilderKey: InjectionKey<
  Ref<IQueryBuilderRow[] | undefined>
> = Symbol('tableQueryBuilder')

export const tableNonHelperColumnsKey: InjectionKey<Ref<TableColumn[]>> =
  Symbol('tableNonHelpersColumns')

export const tableQueryKey: InjectionKey<Ref<ITableDataFetchFncInput>> =
  Symbol('tableQuery')

export const tableStorageKey: InjectionKey<Ref<string>> =
  Symbol('tableStorageKey')

export const tableVersionKey: InjectionKey<Ref<number | undefined>> =
  Symbol('tableVersion')

export const tableCustomDataKey: InjectionKey<Ref<IItem>> =
  Symbol('tableCustomData')

export const tableRecreateQueryBuilderKey: InjectionKey<() => void> = Symbol(
  'tableRecreateQueryBuilder'
)

// Columns
export const tableColumnsKey: InjectionKey<Ref<TableColumn[]>> =
  Symbol('tableColumns')

export const tableColumnsRecreateKey: InjectionKey<() => void> = Symbol(
  'tableColumnsRecreate'
)

export const tableStretchColumnsKey: InjectionKey<() => void> = Symbol(
  'tableStretchColumns'
)

// Editing
export const tableInlineEditKey: InjectionKey<
  ReturnType<typeof useTableEditing>
> = Symbol('tableInlineEdit')

export const tableResizeKey: InjectionKey<() => void> = Symbol('tableResize')

export const tableSlotsKey: InjectionKey<Record<string, any>> =
  Symbol('tableSlots')

// Metadata
export const tableLayoutsKey: InjectionKey<Ref<ITableLayout[]>> =
  Symbol('tableLayouts')

export const tableLayoutKey: InjectionKey<Ref<ITableLayout | undefined>> =
  Symbol('tableLayout')

export const tableViewCodeKey: InjectionKey<Ref<string>> =
  Symbol('tableViewCode')

// Selection
export const tableSelectRowKey: InjectionKey<
  (row: any, options?: { clearSelection?: boolean; val?: boolean }) => void
> = Symbol('tableSelectRow')

export const tableIsSelectedRowKey: InjectionKey<(row: any) => boolean> =
  Symbol('tableIsSelectedRow')

export const tableSelectionKey: InjectionKey<Ref<ITableSelection | undefined>> =
  Symbol('tableSelection')

export const tableClearSelectionKey: InjectionKey<() => void> = Symbol(
  'tableClearSelection'
)

// Export
export const tableExportKey: InjectionKey<
  (options?: {
    rows?: any[]
    columns?: any[]
    exportFormat?: 'xlsx' | 'csv'
  }) => void | Promise<void>
> = Symbol('tableExport')

export const tableIsExportingKey: InjectionKey<Ref<boolean>> =
  Symbol('tableIsExporting')

// Misc
export const tableFocusKey: InjectionKey<() => void> = Symbol('focusTable')
