// TODO: Client-side pagination, filtering, grouping and sorting
// TYPES
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableState } from '~/components/Table/types/table-state.type'
import type { ITableQuery } from '~/components/Table/types/table-query.type'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// COMPOSITION FUNCTIONS
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// CONSTANTS
import { getTableStateDefault } from '~/components/Table/constants/table-state.default'

// INJECTION KEYS
import {
  refreshTableDataKey,
  tableQueryKey,
  tableStateKey,
  updateTableStateKey,
} from '~/components/Table/provide/table.provide'
import { config } from '~/config'

export async function useTableData(
  props: ITableProps,
  internalColumns: MaybeRefOrGetter<TableColumn<any>[]>
) {
  // UTILS
  const instance = getCurrentInstance()
  const { t } = useI18n()
  const { query } = useRoute()
  const { storageKey, modifyWithSearchParams } = useTableUtils()

  // STATE MANAGEMENT
  const tableState = storageKey
    ? useLocalStorage(storageKey, getTableStateDefault())
    : ref(getTableStateDefault())

  // LAYOUT
  const isInitialized = ref(false)
  const isLoading = ref(!props.rows)
  const search = ref('')
  const rows = ref(props.rows || [])
  const totalRows = ref(props.totalRows)

  // PAGINATION
  const {
    currentPage,
    next,
    prev,
    isFirstPage,
    pageCount,
    isLastPage,
    currentPageSize,
  } = useOffsetPagination({
    ...tableState.value,
    total: computed(() => totalRows.value || 0),
    onPageChange: page => {
      if (isInitialized.value) {
        tableState.value.page = page.currentPage
        dbQuery.trigger()
      }
    },
    onPageSizeChange: page => {
      if (isInitialized.value) {
        tableState.value.pageSize = page.currentPageSize
        dbQuery.trigger()
      }
    },
  })

  // DATA
  const dbQuery = computedWithControl(search, () => {
    if (!isInitialized.value) {
      // FIXME: Side-effect in computed
      // Actually happens only once (on initialization), but still...
      modifyWithSearchParams(
        internalColumns,
        tableState,
        currentPage,
        currentPageSize
      )
    }

    // PAGINATION
    const take = currentPageSize.value
    const skip = (currentPage.value - 1) * currentPageSize.value

    // SORTING
    // Project specific?
    const orderBy = toValue(internalColumns)
      .sort((a, b) => {
        return (a.sortOrder || 0) - (b.sortOrder || 0)
      })
      .reduce((agg, col) => {
        if (col.sortDbQuery) {
          agg.push(col.sortDbQuery)
        }

        return agg
      }, [] as Record<string, any>[])

    // FILTERING
    const where = toValue(internalColumns).reduce((agg, col) => {
      if (col.filterDbQuery) {
        Object.assign(agg, col.filterDbQuery)
      }

      return agg
    }, {} as Record<string, any>)

    return {
      where,
      options: {
        search: search.value,
        orderBy,
        take,
        skip,
      },
      includeDeleted: tableState.value.includeDeleted,
    } as ITableQuery
  })

  const refreshData = useDebounceFn(dbQuery.trigger, 100)

  provide(tableQueryKey, dbQuery)
  provide(refreshTableDataKey, refreshData)
  provide(tableStateKey, tableState)
  provide(
    updateTableStateKey,
    (
      state: Partial<ITableState>,

      // We also provide a callback function that allows us to update the state
      // from components that do not have direct access to the table data (for example columns)
      callback?: (
        state: ITableState,
        originalColumns: TableColumn<any>[]
      ) => ITableState,
      updateInternalColumns?: boolean
    ) => {
      const newState: Partial<ITableState> =
        callback?.(tableState.value, toValue(props.columns)) || {}

      // We sometimes need to update the internal columns as well
      // For example when we apply/select a layout that has some filters set up
      if (updateInternalColumns) {
        ;[...(state.columns || []), ...(newState?.columns || [])].forEach(
          column => {
            const foundInternalColumn = toValue(internalColumns).find(
              col => col.field === column.field
            )

            if (foundInternalColumn) {
              Object.assign(foundInternalColumn, column)
            }
          }
        )
      }

      tableState.value = Object.assign({}, tableState.value, state, newState)
    }
  )

  async function fetchData(options: ITableQuery) {
    if (!props.getData) {
      return
    }

    isLoading.value = true
    try {
      const res = await props.getData.fnc(options)
      isLoading.value = false

      let data = get(res, props.getData.mapKey || 'payload') as any[]

      if (props.getData.createIdentifier) {
        data = data.map((row, idx) => {
          Object.assign(row, {
            _uuid: props.getData!.createIdentifier!(row, idx),
          })

          return row
        })
      }

      return {
        data,
        totalRows: get(res, props.getData.countKey || config.table.countKey),
      }
    } catch (error: any) {
      if (props.getData.errorHandler) {
        props.getData.errorHandler(error)
      } else if (error && typeof error === 'object') {
        const message = error.message || error.code || t('unknownError')

        notify(message, 'negative')
      }
    }

    isLoading.value = false
  }

  async function fetchAndSetData(options: ITableQuery) {
    const res = await fetchData(options)

    if (res) {
      rows.value = res.data
      totalRows.value = res.totalRows

      instance?.emit('update:rows', res.data)
      instance?.emit('update:totalRows', res.totalRows)
    }
  }

  // Initialize data if no data are provided
  if (isNil(props.rows)) {
    await fetchAndSetData(dbQuery.value)
  }

  watch(dbQuery, dbQuery => {
    fetchAndSetData(dbQuery)
  })

  // Watch the `dbQuery` and change the url accordingly
  watch(
    dbQuery,
    dbQuery => {
      if (process.server || !props.useUrl) {
        return
      }

      navigateTo(
        {
          query: {
            // We keep the original query params
            ...query,

            // Pagination
            page: String(dbQuery.options.skip / dbQuery.options.take + 1),
            perPage: String(dbQuery.options.take),

            // Search
            ...(dbQuery.options.search && { search: dbQuery.options.search }),
          },
        },
        { replace: true }
      )
    },
    { immediate: true }
  )

  watch(
    () => tableState.value.includeDeleted,
    () => dbQuery.trigger()
  )

  watch(
    () => props.rows,
    _rows => {
      if (_rows) {
        rows.value = _rows
        isLoading.value = false
      }
    }
  )

  isInitialized.value = true

  return {
    isLoading,
    rows,
    dbQuery,
    search,
    tableState,
    totalRows,
    storageKey,
    refreshData,

    // PAGINATION
    currentPage,
    next,
    prev,
    isFirstPage,
    isLastPage,
    pageCount,
    currentPageSize,
  }
}
