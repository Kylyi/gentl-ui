// TODO: Client-side pagination, filtering, grouping and sorting
import { config } from '~/config'

// TYPES
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableState } from '~/components/Table/types/table-state.type'
import type { ITableQuery } from '~/components/Table/types/table-query.type'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'
import { TableColumnState } from '~/components/Table/models/table-column-state.model'

// COMPOSITION FUNCTIONS
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// CONSTANTS
import { getTableStateDefault } from '~/components/Table/constants/table-state.default'

// INJECTION KEYS
import {
  getTableStateKey,
  refreshTableDataKey,
  tableGetTableQueryKey,
  updateTableStateKey,
} from '~/components/Table/provide/table.provide'

export async function useTableData(
  props: ITableProps,
  internalColumns: MaybeRefOrGetter<TableColumn<any>[]>,
  tableStateRef: Ref<ITableState>
) {
  // UTILS
  const instance = getCurrentInstance()
  const { t } = useI18n()
  const { query } = useRoute()
  const { getStorageKey, modifyWithSearchParams } = useTableUtils()

  // Provides
  provide(tableGetTableQueryKey, () => dbQuery.value)
  provide(refreshTableDataKey, () => refreshData())
  provide(getTableStateKey, () => tableStateRef.value)
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
      updateInternalColumns?: boolean,
      updateServerState = true
    ) => {
      // When there are not columns defined in the state yet,
      // we initialize them
      if (!state.columns?.length) {
        tableStateRef.value.columns = toValue(internalColumns).map(col => {
          return new TableColumnState(col)
        })
      }

      const newState: Partial<ITableState> =
        callback?.(tableStateRef.value, toValue(props.columns)) || {}

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

      tableStateRef.value = Object.assign(
        {},
        tableStateRef.value,
        state,
        newState
      )
      console.log('Log ~ tableStateRef.value:', tableStateRef.value)

      // Update the server state
      if (config.table.useServerState && getStorageKey() && updateServerState) {
        GqlUpsertTableStateByName({
          stateName: 'default',
          tableName: getStorageKey()!,
          tableStateUpdateDto: {
            state: tableStateRef.value,
            stateName: 'default',
            tableName: getStorageKey()!,
          },
        })
      }
    }
  )

  // LAYOUT
  const isInitialized = ref(false)
  const isLoading = ref(!props.rows)
  const search = ref('')
  const rows = ref(props.rows || [])
  const totalRows = ref(props.totalRows)

  const storageKey = computed(() => getStorageKey())

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
    ...tableStateRef.value,
    total: computed(() => totalRows.value || 0),
    onPageChange: page => {
      if (isInitialized.value) {
        tableStateRef.value.page = page.currentPage
        dbQuery.trigger()
      }
    },
    onPageSizeChange: page => {
      if (isInitialized.value) {
        tableStateRef.value.pageSize = page.currentPageSize
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
        tableStateRef,
        currentPage,
        currentPageSize
      )
    }

    // PAGINATION
    const take = currentPageSize.value
    const skip = (currentPage.value - 1) * currentPageSize.value

    // SORTING
    // Project specific?
    const orderBy = [...toValue(internalColumns)]
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
      includeDeleted: tableStateRef.value.includeDeleted,
    } as ITableQuery
  })

  const refreshData = useDebounceFn(dbQuery.trigger, 100)

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

      const { pageSize } = getTableStateDefault()

      navigateTo(
        {
          query: {
            // We keep the original query params
            ...query,

            // Pagination
            page: String(
              (dbQuery.options.skip ?? 0) / (dbQuery.options.take ?? pageSize) +
                1
            ),
            perPage: String(dbQuery.options.take ?? pageSize),

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
    () => tableStateRef.value.includeDeleted,
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
