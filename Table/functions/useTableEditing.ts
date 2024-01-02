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
  const editRowHeight = ref(0)
  const {
    model: editValue,
    reset,
    syncFromParent,
    syncToParent,
  } = useRefReset(() => editRow.value?.row)

  function handleEditRow(row: any, column?: TableColumn) {
    isEditing.value = true
    const _rowKey = get(row, rowKey.value)
    editRow.value = { row, key: _rowKey, column }

    // Get the element
    let el = document.querySelector(`[data-key="${_rowKey}"]`) as HTMLElement
    el = el?.querySelector(
      `.cell[data-field="${column?.field}"]`
    ) as HTMLElement

    if (el) {
      editRowHeight.value = el.clientHeight
    }

    syncFromParent()
  }

  function handleCancelEditRow() {
    reset()

    isEditing.value = false
    editRow.value = undefined
  }

  function handleSaveRow(noCancel?: boolean) {
    if (!editRow.value) {
      return
    }

    syncToParent()

    if (!noCancel) {
      isEditing.value = false
      editRow.value = undefined
    }
  }

  provide(tableInlineEditKey, {
    isEditing,
    editRow,
    editRowHeight,
    editValue,
    handleEditRow,
    handleSaveRow,
    handleCancelEditRow,
  })

  return {
    isEditing,
    editRow,
    editRowHeight,
    editValue,
    handleEditRow,
    handleSaveRow,
    handleCancelEditRow,
  }
}
