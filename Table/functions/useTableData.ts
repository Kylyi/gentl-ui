// TODO: Client-side pagination, filtering, grouping and sorting
import { config } from '~/config'

// Types
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'
import { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'
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

export function useTableData(
  props: ITableProps,
  internalColumnsRef: Ref<TableColumn[]>,
  layoutRef: Ref<ITableLayout | undefined>,
  queryBuilder: Ref<IQueryBuilderRow[] | undefined>,
  scrollerEl: Ref<HTMLElement | undefined>,
  metaDataRefetch?: (
    forceRefetch?: boolean,
    options?: { meta?: any }
  ) => Promise<void>,
  recreateColumns?: (shouldRecreate?: boolean) => void,
  resizeColumns?: (force?: boolean) => void
) {
  // Utils
  const route = useRoute()
  const instance = getCurrentInstance()
  const { getStorageKey, parseUrlParams, getRowKey } = useTableUtils(props)
  const { isLoading, handleRequest } = useRequest({
    loadingInitialState: !props.rows,
  })

  // Layout
  const isInitialized = ref(false)
  const hasMore = ref(false)
  const dataHasBeenFetched = ref(false)
  const search = ref('')
  const rows = ref(props.rows || [])
  const totalRows = props.totalRows
    ? useVModel(props, 'totalRows')
    : ref<number>()

  const storageKey = computed(() => getStorageKey())

  // Store
  const { getTableState, setTableState, resetTableState } = useTableStore()
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

  // Infinite scroll
  const fetchMore = ref(false)

  // The id of the fetched row (~ is used for fetching more data)
  const lastRow = computed(() => {
    return rows.value[rows.value.length - 1]
  })

  function handleInfiniteScroll(
    _startIndex: number,
    _endIndex: number,
    _visibleStartIndex: number,
    visibleEndIndex: number
  ) {
    if (!totalRows.value || !rows.value) {
      return
    }

    const isAtBottom = visibleEndIndex >= rows.value.length - 20

    if (hasMore.value && isAtBottom && !fetchMore.value) {
      fetchMore.value = true
      fetchAndSetData(dbQuery, true)
    }
  }

  // Data fetching
  const pagination = computed(() => {
    const { page, pageSize } = config.table.defaultPagination

    const take = tableState.value.pageSize || pageSize
    const skip = ((tableState.value.page || page) - 1) * take

    return { take, skip }
  })

  // Sorting
  const orderBy = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns.reduce((agg, col) => {
      if (col.sortDbQuery) {
        agg.push(col.sortDbQuery)
      }

      return agg
    }, [] as ITableOrderBy[])
  })

  // Columns selection
  const select = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns
      .filter(col => !col.isHelperCol && !col.hidden)
      .map(col => col.field)
  })

  // Column filters
  const columnFilters = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns
      .filter(col => !!col.filterDbQuery)
      .flatMap(col => col.filterDbQuery) as any[]
  })

  const dbQuery = computedWithControl(
    // We trigger the `dbQuery` on basically everything except for column filters
    // Column filters are handled manually!
    () => [orderBy.value, search.value, select.value, queryBuilder.value],
    () => {
      const hasQueryBuilder =
        queryBuilder.value?.length &&
        'isGroup' in queryBuilder.value[0] &&
        queryBuilder.value[0].children.length > 0

      const filters: ITableFilterRow[] = [
        ...(queryBuilder.value && hasQueryBuilder ? queryBuilder.value : []),
        ...columnFilters.value,
      ]

      // We check if we use some filters
      const hasFilters = filters.length > 0

      const tableQuery: ITableQuery = {
        ...pagination.value,
        queryBuilder: queryBuilder.value,
        columnFilters: columnFilters.value,
        filters: hasFilters ? filters : undefined, // Query builder and column filters combined
        orderBy: orderBy.value,
        search: search.value,
        select: select.value,
        includeDeleted: tableState.value.includeDeleted,
        count: true,
      }

      // When there are some columns with `alwaysSelected` attribute set to true,
      // we need to add them to the `select` array
      const fetchTableQuery: ITableQuery = {
        ...tableQuery,
        select: Array.from(
          new Set([
            ...(tableQuery.select || []),
            ...internalColumnsRef.value
              .filter(col => col.alwaysSelected)
              .map(col => col.field),
          ])
        ),
      }

      let fetchInput: ITableDataFetchFncInput = {
        tableQuery,
        fetchTableQuery,
        queryParams: config.table.getQuery(tableQuery),
        fetchQueryParams: config.table.getQuery(fetchTableQuery),
      }

      if (
        'extendTableFetchInput' in config.table &&
        typeof config.table.extendTableFetchInput === 'function'
      ) {
        fetchInput = config.table.extendTableFetchInput(fetchInput)
      }

      return fetchInput
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
        hash: get(result, props.getData.hashKey || config.table.hashKey),
      }
    })
  }

  /**
   * Fetches the data and sets it to the appropriate variables
   */
  async function fetchAndSetData(
    optionsRef: MaybeRefOrGetter<ITableDataFetchFncInput>,
    isFetchMore?: boolean
  ) {
    try {
      const options = toValue(optionsRef)

      // When fetching more data, we need to manually get the queryParams again as
      // it is not triggered in the `dbQuery` computed
      if (isFetchMore) {
        options.fetchQueryParams = config.table.getQuery({
          ...options.fetchTableQuery,
          count: false,
          fetchMore: {
            $key: get(lastRow.value, getRowKey(props)),
            rowKey: getRowKey(props),
            lastRow: lastRow.value,
          },
        })
        options.tableQuery.count = false
      }

      const res = await fetchData(options)

      // When hash mismatches, we force metadata refetch and data refetch
      const currentHash = get(
        tableState.value.meta,
        props.getData?.hashKey || config.table.hashKey
      )
      const newHash = get(res, 'hash')

      if (
        !!currentHash &&
        currentHash !== newHash &&
        !dataHasBeenFetched.value
      ) {
        await metaDataRefetch?.(true)
        recreateColumns?.(false)
        initializeQueryBuilder()
        resizeColumns?.(true)

        return
      }

      if (res) {
        rows.value = isFetchMore ? [...rows.value, ...res.data] : res.data
        totalRows.value = isFetchMore ? totalRows.value : res.totalRows
        hasMore.value =
          totalRows.value! > rows.value.length &&
          options.fetchTableQuery.take! === res.data.length

        instance?.emit('update:rows', rows.value)
        instance?.emit('update:totalRows', totalRows.value)
      }

      // We reset the `fetchMore`
      fetchMore.value = false

      // We set the `dataHasBeenFetched` to true
      dataHasBeenFetched.value = true
    } catch (error) {
      resetTableState(storageKey.value)
    }
  }

  // Fetch and set data on init and when the `dbQuery` changes
  // Also change the URL accordingly
  // Also save the `TableState`
  watch(
    dbQuery,
    async dbQuery => {
      // When we provide the rows, we don't want to fetch them right away
      if (!isInitialized.value && rows.value.length) {
        return
      }

      await fetchAndSetData(dbQuery)

      // Set URL
      if (props.useUrl) {
        const routeQueryWithoutTableParams = omit(route.query, [
          'qb',
          'filters',
          'order',
          'select',
          'search',
        ])
        const qb = serializeFilterString(dbQuery.tableQuery.queryBuilder)
        const filters = serializeFilterString(dbQuery.tableQuery.columnFilters)
        const order = serializeOrderByString(dbQuery.tableQuery.orderBy)
        const select = serializeSelectString(dbQuery.tableQuery.select)

        navigateTo(
          {
            query: {
              ...routeQueryWithoutTableParams,
              ...(qb && qb !== 'and()' && { qb }),
              ...(filters && { filters }),
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
    },
    { immediate: true }
  )

  // We watch the `search`, `filterColumns`, `queryBuilder` and `orderBy`
  // to scroll to the top when they change
  watch([search, columnFilters, queryBuilder, orderBy], () => {
    // @ts-expect-error
    scrollerEl.value?.scrollToItem?.(0)
  })

  // Initialize query builder
  function initializeQueryBuilder() {
    const {
      queryBuilder: urlQueryBuilder,
      columns: urlColumns,
      filters: urlFilters,
      sort: urlSort,
    } = parseUrlParams({ columnsRef: internalColumnsRef })
    const { queryBuilder: schemaQueryBuilder } = parseUrlParams({
      columnsRef: internalColumnsRef,
      searchParams: layoutRef.value?.schema,
    })

    const isUrlUsed =
      !!urlQueryBuilder?.length ||
      !!urlColumns?.length ||
      !!urlFilters?.length ||
      !!urlSort?.length

    const usedQueryBuilder = isUrlUsed ? urlQueryBuilder : schemaQueryBuilder

    // When the query builder is present in the URL, use it
    if (usedQueryBuilder && queryBuilder.value !== undefined) {
      queryBuilder.value = usedQueryBuilder.length
        ? usedQueryBuilder
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

    // Infinite scroll
    handleInfiniteScroll,
  }
}
