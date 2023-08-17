// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableSelection } from '~/components/Table/types/table-selection.type'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Injections
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
  tableSelectionKey,
} from '~/components/Table/provide/table.provide'

export function useTableSelection(props: ITableProps) {
  // Utils
  const { getRowKey } = useTableUtils()

  const selection = props.selected
    ? useVModel(props, 'selected')
    : ref<ITableSelection>({})

  const rowKey = computedEager(() => props.selectionKey ?? getRowKey(props))

  const selectionByKey = computed(() => {
    if (!selection.value) {
      return {}
    }

    if (Array.isArray(selection.value)) {
      return (selection.value as Array<string | number>).reduce((agg, key) => {
        agg[key] = true

        return agg
      }, {} as Record<string | number, boolean>)
    } else {
      return selection.value
    }
  })

  function isSelected(row: any) {
    const key = get(row, rowKey.value)

    return !!selectionByKey.value?.[key]
  }

  function handleSelectRow(row: any) {
    const key = get(row, rowKey.value)
    const _isSelected = isSelected(row)

    if (_isSelected) {
      if (Array.isArray(selection.value)) {
        selection.value = selection.value.filter(k => k !== key)
      } else {
        delete selection.value?.[key]
      }
    } else if (Array.isArray(selection.value)) {
      selection.value = [...(selection.value || []), key]
    } else if (selection.value) {
      selection.value[key] = row
    }
  }

  provide(tableSelectRowKey, handleSelectRow)
  provide(tableIsSelectedRowKey, isSelected)
  provide(tableSelectionKey, selection)

  return {
    selection,
    rowKey,
    handleSelectRow,
    isSelected,
  }
}
