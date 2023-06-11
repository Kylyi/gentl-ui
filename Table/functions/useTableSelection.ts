// TYPES
import type { ITableProps } from '~/components/Table/types/table-props.type'

// COMPOSITION FUNCTIONS
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// INJECTION KEYS
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'

export function useTableSelection(props: ITableProps) {
  // UTILS
  const { getRowKey } = useTableUtils()

  const selection = ref<Record<string | number, boolean>>({})

  const rowKey = computedEager(() => getRowKey(props))

  function isSelected(row: any) {
    return selection.value[row[rowKey.value]]
  }

  function handleSelectRow(row: any) {
    const key = row[rowKey.value]

    selection.value = {
      ...selection.value,
      [key]: !selection.value[key],
    }
  }

  provide(tableSelectRowKey, handleSelectRow)
  provide(tableIsSelectedRowKey, isSelected)

  return {
    selection,
    rowKey,
    handleSelectRow,
    isSelected,
  }
}
