import { config } from '~/config'

// Types
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import {
  tableLayoutKey,
  tableLayoutsKey,
} from '~/components/Table/provide/table.provide'

export async function useTableMetaData(props: ITableProps) {
  // Utils
  const { handleRequest } = useRequest()

  // Layout
  const layouts = ref<ITableLayout[]>([])
  const layout = ref<ITableLayout>()
  const columns = ref<TableColumn[]>(props.columns || [])

  provide(tableLayoutKey, layout)
  provide(tableLayoutsKey, layouts)

  // Data fetching
  async function fetchAndSetMetaData() {
    if (!props.getMetaData) {
      return
    }

    await handleRequest(async () => {
      const { fnc, columnsKey, layoutKey, layoutsKey } = props.getMetaData || {}

      const result = (await fnc?.()) as any[]

      layout.value = get(result, layoutKey || config.table.layoutKey)

      // If using the default value, fake the name
      if (layout.value?.id === 0) {
        layout.value.name = $t('table.layoutStateNoLayout')
      }

      layouts.value = get(result, layoutsKey || config.table.layoutsKey) || []

      const _columns = get(result, columnsKey || config.table.columnsKey)

      if (_columns) {
        columns.value = _columns.map(
          (col: any) =>
            new TableColumn({
              field: col.name,
              label: col.name,
              dataType: col.type,
            })
        )
      }
    })
  }

  await fetchAndSetMetaData()

  return {
    layouts,
    layout,
    columns,
  }
}