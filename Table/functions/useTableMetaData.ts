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

        layout.value = get(result, layoutKey || config.table.layoutKey)

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
        console.log('Log ~ apiColumns:', apiColumns)

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
      { notifyError: false }
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
