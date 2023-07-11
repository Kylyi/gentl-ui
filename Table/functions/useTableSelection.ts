// TYPES
import type { ITableProps } from '~/components/Table/types/table-props.type'

// COMPOSITION FUNCTIONS
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// INJECTION KEYS
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'
import { ITableSelection } from '~/components/Table/types/table-selection.type'

export function useTableSelection(props: ITableProps) {
  // UTILS
  const { getRowKey } = useTableUtils()

  const selection = props.selected
    ? useVModel(props, 'selected')
    : ref<ITableSelection>()

  const rowKey = computedEager(() => props.selectionKey ?? getRowKey(props))

  const selectionByKey = computed(() => {
    if (!selection.value) {
      return {}
    }

    if (Array.isArray(selection.value)) {
      return selection.value.reduce((agg, key) => {
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
    } else {
      Object.assign(selection.value || {}, { [key]: row })
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
