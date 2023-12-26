// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Injections
import { tableInlineEditKey } from '~/components/Table/provide/table.provide'

type ITableEditRow = {
  key: string
  row: any
  column?: TableColumn
}

export function useTableEditing(props: ITableProps) {
  // Utils
  const { getRowKey } = useTableUtils()

  const rowKey = computedEager(() => getRowKey(props))

  const isEditing = ref(false)
  const editRow = ref<ITableEditRow>()
  const {
    model: editValue,
    reset,
    syncFromParent,
    syncToParent,
  } = useRefReset(() => editRow.value?.row)

  function handleEditRow(row: any, column?: TableColumn) {
    isEditing.value = true
    const rowId = get(row, rowKey.value)
    editRow.value = { row, key: rowId, column }

    syncFromParent()
  }

  function handleCancelEditRow() {
    isEditing.value = false
    editRow.value = undefined

    reset()
  }

  function handleSaveRow(noCancel?: boolean) {
    syncToParent()

    if (!noCancel) {
      isEditing.value = false
      editRow.value = undefined
    }
  }

  provide(tableInlineEditKey, {
    isEditing,
    editRow,
    editValue,
    handleEditRow,
    handleSaveRow,
    handleCancelEditRow,
  })

  return {
    isEditing,
    editRow,
    editValue,
    handleEditRow,
    handleSaveRow,
    handleCancelEditRow,
  }
}