// TODO: Client-side pagination, filtering, grouping and sorting
import { UseOffsetPaginationOptions, toValue } from '@vueuse/core'
import { TableColumn } from '~/components/Table/models/table-column.model'

// TYPES
import type { ITableProps } from '~/components/Table/types/table-props.type'

// CONSTANTS / DEFAULTS
const DEFAULT_PAGINATION: Partial<UseOffsetPaginationOptions> = {
  pageSize: 100,
  total: 0,
  page: 1,
}
const DEFAULT_TABLE_STATE = {
  includeDeleted: false,
}

export async function useTableData(
  props: ITableProps,
  internalColumns: MaybeRefOrGetter<TableColumn<any>[]>
) {
  const instance = getCurrentInstance()
  provide('refreshData', () => dbQuery.trigger())

  // STATE MANAGEMENT
  const tableState = props.storageKey
    ? useLocalStorage(props.storageKey, DEFAULT_TABLE_STATE, {})
    : ref(DEFAULT_TABLE_STATE)

  // UTILS
  // const { handleGqlErrors } = useGqlErrors()

  // LAYOUT
  const isLoading = ref(false)
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
    ...DEFAULT_PAGINATION,
    total: computed(() => totalRows.value || 0),
    onPageChange: () => {
      dbQuery.trigger()
    },
  })

  // DATA
  const dbQuery = computedWithControl(search, () => {
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
    }
  })

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
    } catch (error) {
      // handleGqlErrors(error, true)
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

  watch(
    () => tableState.value.includeDeleted,
    () => dbQuery.trigger()
  )

  return {
    isLoading,
    rows,
    dbQuery,
    search,
    tableState,

    // PAGINATION
    currentPage,
    next,
    prev,
    isFirstPage,
    isLastPage,
    pageCount,
  }
}
