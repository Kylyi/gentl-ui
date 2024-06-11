// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableSelection } from '~/components/Table/types/table-selection.type'
import type { ITableSelectionOptions } from '~/components/Table/types/table-selection-options.type'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Injections
import {
  tableClearSelectionKey,
  tableIsSelectedRowKey,
  tableSelectRowKey,
  tableSelectionKey,
} from '~/components/Table/provide/table.provide'

export function useTableSelection(props: ITableProps, rows: Ref<any[]>) {
  // Utils
  const { getRowKey } = useTableUtils()

  const selection = props.selected
    ? useVModel(props, 'selected')
    : ref<ITableSelection>({})

  const rowKey = computed(
    () => props.selectionOptions?.selectionKey ?? getRowKey(props),
  )

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

  async function handleSelectRow(row: any, options?: ITableSelectionOptions) {
    const shouldContinue = await props.selectionOptions?.onSelect?.(
      row,
      selection,
      options,
    )

    if (shouldContinue === false) {
      return
    }

    const { clearSelection: _clearSelection, val } = options ?? {}

    if (_clearSelection) {
      clearSelection()
      await nextTick()
    }

    const key = get(row, rowKey.value)
    const _isSelected = isSelected(row)

    if (val === true && _isSelected) {
      return
    } else if (val === false && !_isSelected) {
      return
    }

    if (_isSelected) {
      if (Array.isArray(selection.value)) {
        selection.value = selection.value.filter(k => k !== key)
      } else {
        delete selection.value?.[key]
      }
    } else if (Array.isArray(selection.value)) {
      selection.value = [...(selection.value || []), key]

      // We need to wait for the next tick to ensure that the selection is updated
      await nextTick()
    } else if (selection.value) {
      selection.value[key] = row
    }
  }

  function refreshSelection(_selection?: ITableSelection) {
    _selection = _selection ?? selection.value

    if (isEmpty(selection.value) || isEmpty(_selection)) {
      return
    }

    // When using Array selection, we don't really do anything
    if (Array.isArray(_selection)) {
      selection.value = _selection
    }

    // When using Object selection, we need to find the rows in the table
    // and replace their current references with the new ones
    else {
      Object.keys(_selection).forEach(key => {
        const row = rows.value.find(row => {
          return row[rowKey.value] === key
        })
        if (row) {
          selection.value![key] = row
        }
      })
    }
  }

  function clearSelection() {
    if (Array.isArray(selection.value)) {
      selection.value = []
    } else {
      selection.value = {}
    }
  }

  provide(tableSelectRowKey, handleSelectRow)
  provide(tableIsSelectedRowKey, isSelected)
  provide(tableSelectionKey, selection)
  provide(tableClearSelectionKey, clearSelection)

  return {
    selection,
    rowKey,
    handleSelectRow,
    isSelected,
    clearSelection,
    refreshSelection,
  }
}
