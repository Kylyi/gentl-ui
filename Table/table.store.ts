import { defineStore } from 'pinia'

// Types
import type { ITableState } from '~/components/Table/types/table-state.type'

// Functions
import { getTableStateDefault } from '~/components/Table/constants/table-state.default'

export const useTableStore = defineStore('table', () => {
  const tableState: Record<string, Ref<ITableState>> = {}

  /**
   * Gets the table state from local storage or from the server
   * depending on the configuration
   */
  function getTableState(tableStorageKey: string): Ref<ITableState> {
    if (tableState[tableStorageKey]) {
      return tableState[tableStorageKey]
    }

    return setTableState(tableStorageKey)
  }

  /**
   * Sets the table state in local storage or on the server
   * depending on the configuration
   */
  function setTableState(
    tableStorageKey: string,
    state?: Partial<ITableState>
  ) {
    // Pick only the relevant data from columns when provided
    if (state?.columns) {
      state.columns = state.columns.map(col => {
        const filters = col.filters
          .filter(filter => !filter.nonInteractive)
          .map(filter => {
            return {
              field: filter.field,
              comparator: filter.comparator,
              value: filter.value,
              dataType: col.dataType,
              id: filter.id,
              filterField: filter.filterField,
            }
          })

        return {
          field: col.field,
          dataType: col.dataType,
          width: col.width,
          hidden: col.hidden,
          sort: col.sort,
          sortOrder: col.sortOrder,
          filters,
          frozen: col.frozen,
          semiFrozen: col.semiFrozen,
          originalWidth: col.originalWidth,
          filterField: col.filterField,
        }
      })
    }

    // We update the local storage state when there is already a state
    if (tableState[tableStorageKey]) {
      tableState[tableStorageKey].value = {
        ...tableState[tableStorageKey].value,
        ...state,
      }

      if (process.client) {
        localStorage.setItem(
          tableStorageKey,
          JSON.stringify({
            ...tableState[tableStorageKey].value,
            ...state,
          })
        )
      }
    }

    // We create the local storage state when there is no state
    else {
      tableState[tableStorageKey] = useLocalStorage(tableStorageKey, {
        ...getTableStateDefault(),
        ...state,
      })
    }

    return tableState[tableStorageKey]
  }

  function resetTableState(tableStorageKey: string) {
    tableState[tableStorageKey] = useLocalStorage(tableStorageKey, {
      ...getTableStateDefault(),
    })
  }

  return {
    tableState,
    getTableState,
    setTableState,
    resetTableState,
  }
})
