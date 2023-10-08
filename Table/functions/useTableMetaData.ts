import { config } from '~/config'

// Types
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import {
  tableLayoutKey,
  tableLayoutsKey,
  tableViewCodeKey,
} from '~/components/Table/provide/table.provide'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Store
import { useTableStore } from '~/components/Table/table.store'

// Constants
const EXTENDABLE_COLUMN_PROPERTIES: Array<keyof TableColumn> = [
  'label',
  'width',
  'align',
  'alwaysSelected',
  'classes',
  'comparator',
  'comparators',
  'dataType',
  'filterFormat',
  'filterable',
  'filters',
  'format',
  'getDistinctData',
  'headerClasses',
  'headerStyle',
  'hidden',
  'hideLabel',
  'link',
  'minWidth',
  'misc',
  'noFilterSort',
  'noFilters',
  'nonInteractive',
  'reorderable',
  'resizable',
  'searchable',
  'sort',
  'sortFormat',
  'sortOrder',
  'sortable',
  'style',
  'width',
]

export async function useTableMetaData(props: ITableProps) {
  // Utils
  const { handleRequest } = useRequest()
  const { getStorageKey } = useTableUtils(props)
  const { getTableMetadata } = useTableSpecifics()

  // Store
  const tableStore = useTableStore()

  // Layout
  const layouts = ref<ITableLayout[]>([])
  const layout = ref<ITableLayout>()
  const viewCode = ref<string>('L')
  const columns = ref<TableColumn[]>(props.columns || [])

  provide(tableLayoutKey, layout)
  provide(tableLayoutsKey, layouts)
  provide(tableViewCodeKey, viewCode)

  // Data fetching
  /**
   * Fetches and sets the metadata
   * @param forceRefetch when true, the metadata will be fetched from the API
   */
  async function fetchAndSetMetaData(
    forceRefetch?: boolean,
    options?: { meta?: any }
  ) {
    const storageKey = getStorageKey()
    const providedMetaData = options?.meta
    const stateMetaData = tableStore.getTableState(storageKey)
    const getGenericMetaData: ITableProps['getMetaData'] = {
      fnc: () => getTableMetadata?.(storageKey),
    }

    // We can either
    // 1. Provide the metadata via options
    // 2. Get the metadata from the state
    // 3. Fetch the metadata from the API (provided we have a props function for it)
    // 4. Get the metadata from the API (provided we have a general function for it)
    if (
      !props.getMetaData &&
      !stateMetaData.value?.meta &&
      !getTableMetadata &&
      !providedMetaData
    ) {
      return
    }

    await handleRequest(
      async () => {
        const { fnc, columnsKey, layoutKey, layoutsKey } =
          props.getMetaData ?? getGenericMetaData ?? {}

        let result: any

        // When we provide explicit metadata, we use that
        if (providedMetaData) {
          result = providedMetaData
        }

        // Otherwise, we decide whether to use the state or fetch from the API
        else {
          result = forceRefetch
            ? await fnc?.()
            : config.table.useLocalStorageForMetaFirst
            ? stateMetaData.value.meta ?? (await fnc?.())
            : await fnc?.()
        }

        tableStore.setTableState(getStorageKey(), { meta: result })

        const _layout = get(result, layoutKey || config.table.layoutKey)
        layout.value = _layout
          ? { ..._layout, preventLayoutReset: true }
          : undefined

        // Project specific
        if (layout.value?.viewCode) {
          viewCode.value = layout.value.viewCode
        }

        // If using the default value, fake the name
        if (layout.value?.id === 0) {
          layout.value.name = $t('table.layoutStateNoLayout')
        }

        layouts.value = get(result, layoutsKey || config.table.layoutsKey) || []

        const apiColumns = get(result, columnsKey || config.table.columnsKey)
        const useAllColumns = props.getMetaData?.useAllColumns ?? true

        // When we have't defined any columns, we just use the data from the API
        // to create the columns
        if (!columns.value.length && apiColumns) {
          columns.value = apiColumns.map((col: any) => {
            return new TableColumn({
              field: col.name,
              label: props.translationPrefix
                ? $t(`${props.translationPrefix}.${col.name}`)
                : col.name,
              dataType: col.type,
            })
          })
        }

        // When we have defined columns, but the API returns more columns, we
        // extend the columns with the data from the API but only if we
        // set the `getMetadata.useAllColumns` to true
        else if (columns.value.length && apiColumns && useAllColumns) {
          columns.value = apiColumns.map((col: any) => {
            const foundColumn = columns.value.find(
              (c: any) => c.field === col.name
            )

            // We extend the column with the data from the API when found
            if (foundColumn) {
              foundColumn.setDataType(col.type)

              EXTENDABLE_COLUMN_PROPERTIES.forEach(prop => {
                if (col[prop] !== undefined) {
                  // @ts-expect-error - TS thinks we might use some readonly props
                  foundColumn[prop] = col[prop]
                }
              })
            }

            return (
              foundColumn ??
              new TableColumn({
                field: col.name,
                label: props.translationPrefix
                  ? $t(`${props.translationPrefix}.${col.name}`)
                  : col.name,
                dataType: col.type,
              })
            )
          })
        }

        // If we defined some columns manually (on FE), we use them and extend
        // them with the data from the API
        else if (columns.value.length) {
          columns.value = columns.value.map(col => {
            const foundColumn = apiColumns?.find(
              (c: any) => c.name === col.field
            )

            if (foundColumn) {
              col.setDataType(foundColumn.type)
            }

            return col
          })
        }
      },
      { notifyError: false, noResolve: true }
    )
  }

  await fetchAndSetMetaData()

  return {
    layouts,
    layout,
    columns,
    fetchAndSetMetaData,
    metadataRefetch: fetchAndSetMetaData,
  }
}
