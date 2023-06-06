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
import { TABLE_STATE_DEFAULT } from '~/components/Table/constants/table-state.default'

export async function useTableData(
  props: ITableProps,
  internalColumns: MaybeRefOrGetter<TableColumn<any>[]>
) {
  // UTILS
  const instance = getCurrentInstance()
  const { replace } = useRouter()
  const { t } = useI18n()
  const { storageKey, modifyWithSearchParams } = useTableUtils()

  // STATE MANAGEMENT
  const tableState = storageKey
    ? useLocalStorage(storageKey, TABLE_STATE_DEFAULT)
    : ref(TABLE_STATE_DEFAULT)

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
    // 9e6 is a hack to make make pagination work on initialization
    // if we set 0, the `useOffsetPagination` thinks that there are no other pages
    // than the first one
    total: computed(() => totalRows.value || 9e6),
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
    const orderBy = toValue(internalColumns).reduce((agg, col) => {
      if (col.sortDbQuery) {
        agg = {
          ...agg,
          ...col.sortDbQuery,
        }
      }

      return agg
    }, {} as Record<string, 'asc' | 'desc'>)

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

  provide(tableQueryKey, dbQuery)
  provide(refreshTableDataKey, useDebounceFn(dbQuery.trigger, 100))
  provide(tableStateKey, tableState)
  provide(
    updateTableStateKey,
    (
      state: Partial<ITableState>,

      // We also provide a callback function that allows us to update the state
      // from components that do not have direct access to the table data (for example columns)
      callback?: (state: ITableState) => ITableState,
      updateInternalColumns?: boolean
    ) => {
      const newState: Partial<ITableState> = callback?.(tableState.value) || {}

      // We sometimes need to update the internal columns as well
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

  async function fetchData(options: any) {
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
        totalRows: get(res, props.getData.countKey || 'totalRows'),
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

  async function fetchAndSetData(options: any) {
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
      replace({
        query: {
          // Pagination
          page: String(dbQuery.options.skip / dbQuery.options.take + 1),
          perPage: String(dbQuery.options.take),

          // Search
          ...(dbQuery.options.search && { search: dbQuery.options.search }),
        },
      })
    },
    { immediate: true }
  )

  watch(
    () => tableState.value.includeDeleted,
    () => dbQuery.trigger()
  )

  isInitialized.value = true

  return {
    isLoading,
    rows,
    dbQuery,
    search,
    tableState,
    storageKey,

    // PAGINATION
    currentPage,
    next,
    prev,
    isFirstPage,
    isLastPage,
    pageCount,
  }
}
