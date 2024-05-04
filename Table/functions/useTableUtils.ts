// Types
import type { DistinctData } from '~/components/Table/types/distinct-data.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import { ComparatorEnum } from '~/libs/App/enums/comparator.enum'

// Injections
import { getTableStorageKey } from '~/components/Table/provide/table.provide'

// Functions
import { getComponentName } from '~/libs/Shared/functions/misc'
import { parseSortingFromUrl } from '~/libs/App/functions/table/extractSortingFromUrl'
import { parseFiltersFromUrl } from '~/libs/App/functions/table/extractFiltersFromUrl'
import { parseVisibleColumnsFromUrl } from '~/libs/App/functions/table/extractVisibleColumnsFromUrl'
import { COMPARATORS_BY_DATATYPE_MAP } from '~/components/Table/constants/comparators-by-datatype-map.const'

// Constants
import {
  BOOLEANISH_COMPARATORS,
  SELECTOR_COMPARATORS,
} from '~/components/Table/constants/comparator-categories.const'

export function useTableUtils(props?: Pick<ITableProps, 'storageKey'>) {
  // Utils
  const { t } = useI18n()
  const { extendParseUrlParams } = useTableSpecifics()

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
      const _label = label !== '' ? label : `(${t('general.empty')})`

      return {
        id: get(item, field || col.field),
        label: _label,

        ref: item,
      }
    })
  }

  /**
   * Gets the available comparators for a given data type
   */
  function getAvailableComparators(
    dataType: ExtendedDataType,
    options: {
      includeSelectorComparators?: boolean
      allowedComparators?: ComparatorEnum[]
      extraComparators?: ComparatorEnum[]
    } = {}
  ): ComparatorEnum[] {
    const {
      includeSelectorComparators,
      allowedComparators,
      extraComparators = [],
    } = options
    const comparators: ComparatorEnum[] = [
      ...COMPARATORS_BY_DATATYPE_MAP[dataType],
      ...SELECTOR_COMPARATORS,
    ]

    if (allowedComparators) {
      return uniq(
        comparators.filter(comparator =>
          allowedComparators.includes(comparator)
        )
      )
    } else if (!includeSelectorComparators) {
      return uniq([
        ...comparators.filter(comparator => {
          return !SELECTOR_COMPARATORS.includes(comparator)
        }),
        ...COMPARATORS_BY_DATATYPE_MAP[dataType],
        ...extraComparators,
      ])
    }

    return uniq([...comparators, ...extraComparators])
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
   * Checks if a comparator is of type `empty`
   */
  function isEmptyComparator(comparator: ComparatorEnum) {
    return (
      comparator === ComparatorEnum.IS_EMPTY ||
      comparator === ComparatorEnum.NOT_IS_EMPTY
    )
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

  /**
   * Checks if a comparator is of type `booleanish` (IS, NOT_IS)
   */
  function isBooleanishComparator(comparator: ComparatorEnum) {
    return BOOLEANISH_COMPARATORS.includes(comparator)
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
    fromSchema?: boolean
    allowAnyNonStandardFilter?: boolean
  }) {
    const {
      columnsRef,
      searchParams,
      fromSchema,
      allowAnyNonStandardFilter = false,
    } = options
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
    const sort = parseSortingFromUrl(params, { fromSchema })
    const schemaSort = parseSortingFromUrl(params, { fromSchema })

    // Column filters
    const filters = parseFiltersFromUrl({
      searchParams: params,
      key: 'filters',
      columns,
      fromSchema,
    })

    // Query builder
    const queryBuilder = parseFiltersFromUrl({
      searchParams: params,
      key: 'qb',
      columns,
      fromSchema,
    })

    // Column selection
    const visibleColumns = parseVisibleColumnsFromUrl(params)

    return extendParseUrlParams
      ? extendParseUrlParams({
          searchParams: params,
          tableColumns: columns,
          columns: visibleColumns,
          filters,
          sort,
          schemaSort,
          queryBuilder,
          allowAnyNonStandardFilter,
          fromSchema,
          parseUrlFnc: parseUrlParams,
        })
      : {
          sort,
          schemaSort,
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
    canUseSelectorComparator,
    isSelectorComparator,
    isDateAgoComparator,
    isEmptyComparator,
    isBooleanishComparator,
    parseUrlParams,
  }
}
