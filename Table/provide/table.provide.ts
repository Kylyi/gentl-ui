import type { WritableComputedRef } from 'vue'

// Types
import type { ITableSelection } from '~/components/Table/types/table-selection.type'
import type { ITableDataFetchFncInput } from '~/components/Table/types/table-query.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Functions
import type { useTableEditing } from '~/components/Table/functions/useTableEditing'

// Models
import type { TableColumn } from '~/components/Table/models/table-column.model'

// Components
import type VirtualScroller from '~/components/VirtualScroller/VirtualScroller.vue'

/**
 * Gets the `storageKey` ~ a unique identificator of given table that is used for
 * saving state
 */
export const getTableStorageKey: InjectionKey<() => string> = Symbol('getTableStorageKey')

export const tableStorageKey: InjectionKey<Ref<string>> = Symbol('tableStorageKey')

export const tableIdKey: InjectionKey<string> = Symbol('tableId')
/**
 * Whether the fetch query should include the `includeDeleted` prop to also get deleted rows
 */
export const tableIncludeDeletedKey: InjectionKey<Ref<boolean>> = Symbol('tableIncludeDeleted')

// SECTION: State
/**
 * Table rows
 */
export const tableRowsKey: InjectionKey<Ref<any[]>> = Symbol('tableRows')

/**
 * Table columns
 */
export const tableColumnsKey: InjectionKey<Ref<TableColumn[]>>
  = Symbol('tableColumns')

/**
 * Refreshes table data (refetches them)
 */
export const tableRefreshKey: InjectionKey<(force?: boolean) => void>
  = Symbol('refreshTableData')

/**
 * Table query builder
 */
export const tableQueryBuilderKey: InjectionKey<
  Ref<IQueryBuilderRow[] | undefined>
> = Symbol('tableQueryBuilder')

/**
 * Table non-helper columns (~ only columns that contain actual data)
 */
export const tableNonHelperColumnsKey: InjectionKey<Ref<TableColumn[]>> = Symbol('tableNonHelperColumns')

/**
 * Table query
 */
export const tableQueryKey: InjectionKey<Ref<ITableDataFetchFncInput>> = Symbol('tableQuery')

// SECTION: Utils
/**
 * Will recreate the query builder
 */
export const tableRecreateQueryBuilderKey: InjectionKey<() => void> = Symbol('tableRecreateQueryBuilder')

/**
 * Will recreate the table columns
 */
export const tableColumnsRecreateKey: InjectionKey<() => void> = Symbol('tableColumnsRecreate')

export const tableStretchColumnsKey: InjectionKey<() => void> = Symbol('tableStretchColumns')

// Editing
export const tableInlineEditKey: InjectionKey<
  ReturnType<typeof useTableEditing>
> = Symbol('tableInlineEdit')

export const tableResizeKey: InjectionKey<() => void> = Symbol('tableResize')

// SECTION: Selection
/**
 * Function to select a row
 */
export const tableSelectRowKey: InjectionKey<
  (row: any, options?: { clearSelection?: boolean, val?: boolean }) => Promise<void>
> = Symbol('tableSelectRow')

/**
 * Function that checks whether a row is selected
 */
export const tableIsSelectedRowKey: InjectionKey<(row: any) => boolean> = Symbol('tableIsSelectedRow')

/**
 * Returns currently selected rows
 */
export const tableSelectionKey: InjectionKey<Ref<ITableSelection | undefined>> = Symbol('tableSelection')

/**
 * Clears currently selected rows
 */
export const tableClearSelectionKey: InjectionKey<() => void> = Symbol('tableClearSelection')

// SECTION: Export
export const tableExportKey: InjectionKey<
  (options?: {
    rows?: any[]
    columns?: any[]
    exportFormat?: 'xlsx' | 'csv'
    formatName?: () => string
  }) => void | Promise<void>
> = Symbol('tableExport')

export const tableIsExportingKey: InjectionKey<Ref<boolean>> = Symbol('tableIsExporting')

// SECTION: Layout-related
/**
 * Focuses the table to allow keyboard navigation
 */
export const tableFocusKey: InjectionKey<() => void> = Symbol('focusTable')

/**
 * Access to the table slots
 */
export const tableSlotsKey: InjectionKey<Record<string, any>> = Symbol('tableSlots')

/**
 * Access to the table scroller component
 */
export const tableScrollerEl: InjectionKey<Ref<ComponentInstance<typeof VirtualScroller>>> = Symbol('tableScrollerEl')

/**
 * The custom data is a project-specific or table-specific object that can be extended through config,
 * this data is then provided back in slots and other functions
 */
export const tableCustomDataKey: InjectionKey<Ref<IItem>> = Symbol('tableCustomData')

// SECTION: Metadata
export const tableLayoutsKey: InjectionKey<Ref<ITableLayout[]>> = Symbol('tableLayouts')

export const tableLayoutKey: InjectionKey<Ref<ITableLayout | undefined>> = Symbol('tableLayout')

export const tableViewCodeKey: InjectionKey<Ref<string>> = Symbol('tableViewCode')

export const tableVersionKey: InjectionKey<Ref<number | null | undefined>> = Symbol('tableVersion')

/**
 * The table will inject this key and provide the value in slots and/or functions
 */
export const tableExternalDataKey: InjectionKey<WritableComputedRef<IItem>> = Symbol('tableExternalData')
