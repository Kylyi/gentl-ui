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

export async function useTableMetaData(props: ITableProps) {
  // Utils
  const { handleRequest } = useRequest()

  // Layout
  const layouts = ref<ITableLayout[]>([])
  const layout = ref<ITableLayout>()
  const viewCode = ref<string>('L')
  const columns = ref<TableColumn[]>(props.columns || [])

  provide(tableLayoutKey, layout)
  provide(tableLayoutsKey, layouts)
  provide(tableViewCodeKey, viewCode)

  // Data fetching
  async function fetchAndSetMetaData() {
    if (!props.getMetaData) {
      return
    }

    await handleRequest(
      async () => {
        const { fnc, columnsKey, layoutKey, layoutsKey } =
          props.getMetaData || {}

        const result = (await fnc?.()) as any[]

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

        const _columns = get(result, columnsKey || config.table.columnsKey)

        // When we have't defined any columns, we just use the data from the API
        // to create the columns
        if (!columns.value.length && _columns) {
          columns.value = _columns.map((col: any) => {
            return new TableColumn({
              field: col.name,
              label: col.name,
              dataType: col.type,
            })
          })
        }

        // If we defined some columns manually (on FE), we use them and extend
        // them with the data from the API
        else if (columns.value.length) {
          columns.value = columns.value.map(col => {
            const foundColumn = _columns?.find((c: any) => c.name === col.field)

            if (foundColumn) {
              console.log(foundColumn.name, foundColumn.type)

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
  }
}
