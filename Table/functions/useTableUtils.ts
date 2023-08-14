// Types
import type { DistinctData } from '~/components/Table/types/distinct-data.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// Functions
import { getComponentName } from '~/libs/App/functions/misc'
import { parseFiltersFromUrl } from '~/components/Table/utils/extractFiltersFromUrl'
import { parseSortingFromUrl } from '~/components/Table/utils/extractSortingFromUrl'
import { parseVisibleColumnsFromUrl } from '~/components/Table/utils/extractVisibleColumnsFromUrl'

// Constants
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
    } = {}
  ) {
    const { includeSelectorComparators, allowedComparators } = options
    const comparators: ComparatorEnum[] =
      CONDITIONS_BY_DATATYPE_MAP[dataType] ?? []

    if (allowedComparators) {
      return comparators.filter(comparator =>
        allowedComparators.includes(comparator)
      )
    } else if (!includeSelectorComparators) {
      return comparators.filter(comparator => {
        return !SELECTOR_COMPARATORS.includes(comparator)
      })
    }

    return comparators
  }

  /**
   * Checks if a comparator uses a `Selector` (IN, NOT_IN) to choose the filter data
   */
  function isSelectorComparator(comparator: ComparatorEnum) {
    return SELECTOR_COMPARATORS.includes(comparator)
  }

  function hasVisibleCol(columns: TableColumn[]) {
    return columns.some(col => !col.hidden)
  }

  /**
   * Extracts the relevant data from URL
   */
  function parseUrlParams(columnsRef?: MaybeRefOrGetter<TableColumn[]>) {
    const url = useRequestURL()
    const params = url.searchParams
    const columns = toValue(columnsRef)

    // Pagination
    // Not relevant for Infinite scrolling

    // Sorting
    const sort = parseSortingFromUrl(params)

    // Column filters
    const filters = parseFiltersFromUrl({
      searchParams: params,
      key: 'filter',
      columns,
    })

    // Query builder
    const queryBuilder = parseFiltersFromUrl({
      searchParams: params,
      key: 'qb',
      columns,
    })

    // Column selection
    const visibleColumns = parseVisibleColumnsFromUrl(params)

    return {
      sort,
      filters,
      queryBuilder,
      columns: visibleColumns,
    }
  }

  return {
    getStorageKey,
    hasVisibleCol,
    getRowKey,
    getDistinctDataForField,
    getAvailableComparators,
    isSelectorComparator,
    parseUrlParams,
  }
}
