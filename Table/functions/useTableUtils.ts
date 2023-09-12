// Types
import type { DistinctData } from '~/components/Table/types/distinct-data.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// Injections
import { getTableStorageKey } from '~/components/Table/provide/table.provide'

// Functions
import { getComponentName } from '~/libs/App/functions/misc'
import { parseFiltersFromUrl } from '~/components/Table/utils/extractFiltersFromUrl'
import { parseSortingFromUrl } from '~/components/Table/utils/extractSortingFromUrl'
import { parseVisibleColumnsFromUrl } from '~/components/Table/utils/extractVisibleColumnsFromUrl'

// Constants
import { COMPARATORS_BY_DATATYPE_MAP } from '~/libs/App/constants/input-map.constant'

const SELECTOR_COMPARATORS = [ComparatorEnum.IN, ComparatorEnum.NOT_IN]

export function useTableUtils(props?: Pick<ITableProps, 'storageKey'>) {
  // Utils
  const { t } = useI18n()

  const instance = getCurrentInstance()

  function getRowKey(tableProps: ITableProps) {
    if (tableProps.getData?.createIdentifier) {
      return '_uuid'
    }

    return tableProps.rowKey || 'id'
  }

  function getStorageKey() {
    return (
      props?.storageKey || getComponentName(instance?.parent) || generateUUID()
    )
  }

  provide(getTableStorageKey, getStorageKey)

  async function getDistinctDataForField<T>(
    col: TableColumn<T>,
    query: Function,
    options: {
      includeDeleted?: boolean
      mapKey?: string
      where?: any
      field?: string
      distinct?: string[]
      include?: string[]
    } = {}
  ): Promise<DistinctData[]> {
    const {
      includeDeleted = false,
      mapKey = 'distinctData',
      field,
      distinct,
      include,
    } = options
    const distinctField = distinct ?? [field || col.field]

    const res = await query({
      include,
      includeDeleted,
      distinct: distinctField,
      where: options.where,
    })
    const data = get(res, mapKey)

    return data.map((item: any) => {
      const label = col.format?.(item) ?? get(item, distinctField[0])
      const _label = label !== '' ? label : `(${t('empty')})`

      return {
        ...item,
        _value: get(item, field || col.field),
        _label,
      }
    })
  }

  /**
   * Gets the available comparators for a given data type
   */
  function getAvailableComparators(
    dataType: DataType,
    options: {
      includeSelectorComparators?: boolean
      allowedComparators?: ComparatorEnum[]
      extraComparators?: ComparatorEnum[]
    } = {}
  ) {
    const {
      includeSelectorComparators,
      allowedComparators,
      extraComparators = [],
    } = options
    const comparators: ComparatorEnum[] =
      [...COMPARATORS_BY_DATATYPE_MAP[dataType], ...SELECTOR_COMPARATORS] ?? []

    if (allowedComparators) {
      return comparators.filter(comparator =>
        allowedComparators.includes(comparator)
      )
    } else if (!includeSelectorComparators) {
      return [
        ...comparators.filter(comparator => {
          return !SELECTOR_COMPARATORS.includes(comparator)
        }),
        ...extraComparators,
      ]
    }

    return [...comparators, ...extraComparators]
  }

  /**
   * Checks if a comparator CAN be used with a `Selector` (IN, NOT_IN, EQUAL, NOT_EQUAL)
   * to choose the filter data
   */
  function canUseSelectorComparator(
    comparator: ComparatorEnum,
    col: TableColumn
  ) {
    const comparators = col.getDistinctData
      ? [
          ...SELECTOR_COMPARATORS,
          ComparatorEnum.EQUAL,
          ComparatorEnum.NOT_EQUAL,
        ]
      : SELECTOR_COMPARATORS

    return comparators.includes(comparator)
  }

  /**
   * Checks if a comparator uses a `Selector` (IN, NOT_IN) to choose the filter data
   */
  function isSelectorComparator(comparator: ComparatorEnum) {
    return SELECTOR_COMPARATORS.includes(comparator)
  }

  /**
   * Checks if a comparator is of type `ago` (AGO, NOT_AGO, UNTIL, NOT_UNTIL)
   */
  function isDateAgoComparator(comparator: ComparatorEnum) {
    return (
      comparator === ComparatorEnum.AGO ||
      comparator === ComparatorEnum.NOT_AGO ||
      comparator === ComparatorEnum.UNTIL ||
      comparator === ComparatorEnum.NOT_UNTIL
    )
  }

  function hasVisibleCol(columns: TableColumn[]) {
    return columns.some(col => !col.hidden)
  }

  /**
   * Extracts the relevant data from URL
   */
  function parseUrlParams(options: {
    columnsRef?: MaybeRefOrGetter<TableColumn[]>
    searchParams?: URLSearchParams | string
  }) {
    const { columnsRef, searchParams } = options
    const customSearchParams = searchParams
      ? new URLSearchParams(searchParams)
      : undefined

    const url = useRequestURL()
    const params = customSearchParams || url.searchParams
    const columns = toValue(columnsRef)

    // Pagination
    // TODO: Pagination for non-infinite scrolling cases
    // Not relevant for Infinite scrolling

    // Sorting
    const sort = parseSortingFromUrl(params)
    const schemaSort = parseSortingFromUrl(params, { fromSchema: true })

    // Column filters
    let filters = parseFiltersFromUrl({
      searchParams: params,
      key: 'filters',
      columns,
    })

    // Query builder
    let queryBuilder = parseFiltersFromUrl({
      searchParams: params,
      key: 'qb',
      columns,
    })

    // Filters and query builder
    const filtersAndQueryBuilder = parseFiltersFromUrl({
      searchParams: params,
      key: 'and',
      columns,
      fromSchema: true,
    })

    if (filtersAndQueryBuilder.length) {
      // Column filters do not use grouping, therefore, if the first index is a
      // group, it is actually the query builder
      const hasQueryBuilder = 'isGroup' in filtersAndQueryBuilder[0]

      if (hasQueryBuilder) {
        queryBuilder = [filtersAndQueryBuilder[0]]
        filters = filtersAndQueryBuilder.slice(1)
      } else {
        filters = filtersAndQueryBuilder
      }
    }

    // Column selection
    const visibleColumns = parseVisibleColumnsFromUrl(params)

    return {
      sort,
      schemaSort,
      filters,
      queryBuilder,
      columns: visibleColumns,
      filtersAndQueryBuilder,
    }
  }

  return {
    getStorageKey,
    hasVisibleCol,
    getRowKey,
    getDistinctDataForField,
    getAvailableComparators,
    canUseSelectorComparator,
    isSelectorComparator,
    isDateAgoComparator,
    parseUrlParams,
  }
}
