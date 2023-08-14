// TODO: Client-side pagination, filtering, grouping and sorting
import { config } from '~/config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type {
  ITableDataFetchFncInput,
  ITableFilterRow,
  ITableOrderBy,
  ITableQuery,
} from '~/components/Table/types/table-query.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'
import {
  serializeFilterString,
  serializeOrderByString,
  serializeSelectString,
} from '~/components/Table/utils/transformTableQueryToQueryParams'

// Injections
import {
  tableQueryKey,
  tableRecreateQueryBuilderKey,
  tableRefreshKey,
  tableStorageKey,
} from '~/components/Table/provide/table.provide'

// Store
import { useTableStore } from '~/components/Table/table.store'

export async function useTableData(
  props: ITableProps,
  internalColumnsRef: Ref<TableColumn[]>
) {
  // Utils
  const route = useRoute()
  const instance = getCurrentInstance()
  const { getStorageKey, parseUrlParams } = useTableUtils()
  const { isLoading, handleRequest } = useRequest({
    loadingInitialState: !props.rows,
  })

  // Layout
  const isInitialized = ref(false)
  const search = ref('')
  const rows = ref(props.rows || [])
  const totalRows = ref(props.totalRows)
  const queryBuilder = useVModel(props, 'queryBuilder')

  const storageKey = computed(() => getStorageKey())

  // Store
  const { getTableState, setTableState } = useTableStore()
  const tableState = getTableState(storageKey.value)

  initializeQueryBuilder()

  // Provides
  provide(tableRefreshKey, () => refreshData())
  provide(tableRecreateQueryBuilderKey, () => initializeQueryBuilder())
  provide(tableStorageKey, storageKey)

  // Pagination
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

  // Data fetching
  const pagination = computed(() => {
    const { page, pageSize } = config.table.defaultPagination

    const take = tableState.value.pageSize || pageSize
    const skip = ((tableState.value.page || page) - 1) * take

    return { take, skip }
  })

  const orderBy = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns.reduce((agg, col) => {
      if (col.sortDbQuery) {
        agg.push(col.sortDbQuery)
      }

      return agg
    }, [] as ITableOrderBy[])
  })

  const select = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns
      .filter(col => !col.isHelperCol && !col.hidden)
      .map(col => col.field)
  })

  const columnFilters = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns
      .filter(col => !!col.filterDbQuery)
      .flatMap(col => col.filterDbQuery) as any[]
  })

  const dbQuery = computedWithControl(
    () => [orderBy.value, search.value, select.value, queryBuilder.value],
    () => {
      const filter: ITableFilterRow[] = [
        {
          isGroup: true,
          condition: 'AND',
          children: [...(props.queryBuilder || []), ...columnFilters.value],
        },
      ]

      const tableQuery: ITableQuery = {
        ...pagination.value,
        queryBuilder: props.queryBuilder,
        columnFilters: columnFilters.value,
        filter,
        orderBy: orderBy.value,
        search: search.value,
        select: select.value,
        includeDeleted: tableState.value.includeDeleted,
      }

      return {
        queryParams: config.table.getQuery(tableQuery),
        tableQuery,
      }
    }
  )

  provide(tableQueryKey, dbQuery)

  const refreshData = useDebounceFn(dbQuery.trigger, 100)

  /**
   * The function that actually fetches the data from the server
   */
  function fetchData(optionsRef: MaybeRefOrGetter<ITableDataFetchFncInput>) {
    return handleRequest(async () => {
      if (!props.getData) {
        return
      }

      const options = toValue(optionsRef)
      const result = await props.getData.fnc(options)
      let data = get(
        result,
        props.getData.payloadKey || config.table.payloadKey
      ) as any[]

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
        totalRows: get(result, props.getData.countKey || config.table.countKey),
      }
    })
  }

  /**
   * Fetches the data and sets it to the appropriate variables
   */
  async function fetchAndSetData(
    optionsRef: MaybeRefOrGetter<ITableDataFetchFncInput>
  ) {
    const res = await fetchData(optionsRef)

    if (res) {
      rows.value = res.data
      totalRows.value = res.totalRows

      instance?.emit('update:rows', res.data)
      instance?.emit('update:totalRows', res.totalRows)
    }
  }

  // Initialize data if no data are provided
  if (isNil(props.rows)) {
    await fetchAndSetData(dbQuery)
  }

  // Fetch and set data when the `dbQuery` changes
  // Also change the URL accordingly
  // Also save the `TableState`
  watch(dbQuery, dbQuery => {
    fetchAndSetData(dbQuery)

    // Set URL
    if (props.useUrl) {
      const routeQueryWithoutTableParams = omit(route.query, [
        'qb',
        'filter',
        'order',
        'select',
        'search',
      ])
      const qb = serializeFilterString(dbQuery.tableQuery.queryBuilder)
      const filter = serializeFilterString(dbQuery.tableQuery.columnFilters)
      const order = serializeOrderByString(dbQuery.tableQuery.orderBy)
      const select = serializeSelectString(dbQuery.tableQuery.select)

      navigateTo(
        {
          query: {
            ...routeQueryWithoutTableParams,
            ...(qb && qb !== 'and()' && { qb }),
            ...(filter && { filter }),
            ...(order && { order: `(${order})` }),
            ...(select && { select }),
            ...(dbQuery.tableQuery.search && {
              search: dbQuery.tableQuery.search,
            }),
            // ...(dbQuery.tableQuery.includeDeleted && {
            //   includeDeleted: dbQuery.tableQuery.includeDeleted,
            // }),
          },
        },
        { replace: true }
      )
    }

    // Save `TableState`
    setTableState(storageKey.value, {
      page: dbQuery.tableQuery.skip! / dbQuery.tableQuery.take! + 1,
      pageSize: dbQuery.tableQuery.take!,
      includeDeleted: dbQuery.tableQuery.includeDeleted,
      schema: dbQuery.queryParams.toString(),
      columns: internalColumnsRef.value,
      queryBuilder: dbQuery.tableQuery.queryBuilder,
    })
  })

  // Initialize query builder
  function initializeQueryBuilder() {
    const {
      queryBuilder: queryBuilderFromUrl,
      columns: columnsFromUrl,
      filters: filtersFromUrl,
      sort: sortFromUrl,
    } = parseUrlParams(internalColumnsRef)

    const isUrlUsed =
      !!queryBuilderFromUrl?.length ||
      !!columnsFromUrl?.length ||
      !!filtersFromUrl?.length ||
      !!sortFromUrl?.length

    // When the query builder is present in the URL, use it
    if (queryBuilderFromUrl && queryBuilder.value !== undefined) {
      queryBuilder.value = queryBuilderFromUrl.length
        ? queryBuilderFromUrl
        : [
            {
              id: generateUUID(),
              isGroup: true,
              children: [],
              condition: 'AND',
              path: '0',
            },
          ]
    }

    // Otherwise, when the query builder is present in the table state, use it
    else if (
      !config.table.useServerState &&
      !isUrlUsed &&
      tableState.value.queryBuilder?.length &&
      queryBuilder.value !== undefined
    ) {
      queryBuilder.value = tableState.value.queryBuilder
    }
  }

  isInitialized.value = true

  return {
    isLoading,
    rows,
    dbQuery,
    search,
    totalRows,
    storageKey,
    refreshData,

    // Pagination
    currentPage,
    next,
    prev,
    isFirstPage,
    isLastPage,
    pageCount,
    currentPageSize,
  }
}
