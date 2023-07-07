// TYPES
import type { IItem } from '~/libs/App/types/item.type'
import type { DistinctData } from '~/components/Table/types/distinct-data.type'
import type { ITableQuery } from '~/components/Table/types/table-query.type'
import type { ITableState } from '~/components/Table/types/table-state.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'
import { TableColumnState } from '~/components/Table/models/table-column-state.model'
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'
import { FilterItem } from '~/libs/App/data/models/filter-item'

// FUNCTIONS
import { getComponentName } from '~/libs/App/functions/misc'
import { getTableStateDefault } from '~/components/Table/constants/table-state.default'

// COMPONENTS
import NumberInput from '~/components/Inputs/NumberInput/NumberInput.vue'
import DateInput from '~/components/Inputs/DateInput/DateInput.vue'
import Checkbox from '~/components/Checkbox/Checkbox.vue'
import TextInput from '~/components/Inputs/TextInput/TextInput.vue'
import YearMonthSelector from '~/components/YearMonthSelector/YearMonthSelector.vue'

const SELECTOR_COMPARATORS = [ComparatorEnum.IN, ComparatorEnum.NOT_IN]

export function useTableUtils(props?: Pick<ITableProps, 'storageKey'>) {
  const instance = getCurrentInstance()
  const storageKey =
    props?.storageKey !== false
      ? props?.storageKey || getComponentName(instance?.parent)
      : undefined

  async function getDistinctDataForField<T>(
    col: TableColumn<T>,
    query: Function,
    options: {
      includeDeleted?: boolean
      mapKey?: string
      where?: any
      field?: string
    } = {}
  ): Promise<DistinctData[]> {
    const { includeDeleted = false, mapKey = 'distinctData', field } = options
    const distinctField = [field || col.field]

    const res = await query({
      includeDeleted,
      distinct: distinctField,
      where: options.where,
    })
    const data = get(res, mapKey)

    return data.map((item: any) => {
      return {
        ...item,
        _value: get(item, field || col.field),
        _label: col.format?.(item) ?? get(item, distinctField[0]),
      }
    })
  }

  function getRowKey(tableProps: ITableProps) {
    if (tableProps.getData?.createIdentifier) {
      return '_uuid'
    }

    return tableProps.rowKey || 'id'
  }

  /**
   * Will extract data from the table columns and return it in a format that can be used to
   * save the state of the columns
   */
  function extractColumnsStateData(columns: TableColumn[]) {
    return columns.map(col => new TableColumnState(col))
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
    let comparators: ComparatorEnum[] = []

    switch (dataType) {
      case 'number':
      case 'percent':
        comparators = [
          ComparatorEnum.EQUAL,
          ComparatorEnum.NOT_EQUAL,
          ComparatorEnum.GREATER_THAN,
          ComparatorEnum.GREATER_THAN_OR_EQUAL,
          ComparatorEnum.LESS_THAN,
          ComparatorEnum.LESS_THAN_OR_EQUAL,
          ...(includeSelectorComparators ? SELECTOR_COMPARATORS : []),
        ]

        break

      case 'date':
      case 'yearMonth':
        comparators = [
          ComparatorEnum.EQUAL,
          ComparatorEnum.NOT_EQUAL,
          ComparatorEnum.GREATER_THAN_OR_EQUAL,
          ComparatorEnum.LESS_THAN_OR_EQUAL,
          ...(includeSelectorComparators ? SELECTOR_COMPARATORS : []),
        ]

        break

      case 'boolean':
        comparators = [ComparatorEnum.EQUAL]

        break

      case 'string':
      default:
        comparators = [
          ComparatorEnum.EQUAL,
          ComparatorEnum.NOT_EQUAL,
          ComparatorEnum.STARTS_WITH,
          ComparatorEnum.ENDS_WITH,
          ComparatorEnum.CONTAINS,
          ...(includeSelectorComparators ? SELECTOR_COMPARATORS : []),
        ]

        break
    }

    if (allowedComparators) {
      return comparators.filter(comparator =>
        allowedComparators.includes(comparator)
      )
    }

    return comparators
  }

  /**
   * Gets the input component for a given data type
   */
  function getInputByDataType(dataType: DataType) {
    switch (dataType) {
      case 'number':
      case 'percent':
        return NumberInput

      case 'date':
      case 'datetime':
        return DateInput

      case 'yearMonth':
        return YearMonthSelector

      case 'boolean':
        return Checkbox

      case 'string':
      default:
        return TextInput
    }
  }

  /**
   * Checks if a comparator uses a `Selector` (IN, NOT_IN) to choose the filter data
   */
  function isSelectorComparator(comparator: ComparatorEnum) {
    return SELECTOR_COMPARATORS.includes(comparator)
  }

  /**
   * Parses the value of a filter param based on the comparator and data type
   */
  function parseParamValue(
    value: string,
    comparator: ComparatorEnum,
    dataType: DataType
  ) {
    switch (comparator) {
      case ComparatorEnum.IN:
      case ComparatorEnum.NOT_IN:
        return JSON.parse(value).split(',')

      case ComparatorEnum.CONTAINS:
      case ComparatorEnum.STARTS_WITH:
      case ComparatorEnum.ENDS_WITH:
        return value

      case ComparatorEnum.EQUAL:
      case ComparatorEnum.NOT_EQUAL:
        if (dataType === 'string') {
          return value
        } else {
          return JSON.parse(value)
        }

      default:
        return JSON.parse(value)
    }
  }

  /**
   * Transforms the URL search params into a `ITableQuery` object
   */
  function transformUrlSearchParams(columns: TableColumn[]) {
    let isUrlUsedForFiltering = false
    const url = useRequestURL()
    const params = url.searchParams
    const tableQueryWhere: ITableQuery['where'] = {}
    const tableQueryOptions: Partial<ITableQuery['options']> = {}
    const urlUsedFor: Array<'pagination' | 'filter' | 'sort'> = []

    // Pagination
    const page = params.get('page')
    const perPage = params.get('perPage')

    if (page !== null && perPage !== null) {
      Object.assign(tableQueryOptions, {
        skip: (+page - 1) * +perPage,
        take: +perPage,
      })

      urlUsedFor.push('pagination')
    }

    // Sorting & filtering
    if (params.getAll('sort').length) {
      urlUsedFor.push('sort')
    }

    columns.forEach(col => {
      // Sorting
      const sort = params.getAll('sort')
      const sortField = sort.find(s => s.startsWith(String(col.field)))

      if (sortField) {
        const parts = sortField.split('.')
        const direction = parts.pop() as 'asc' | 'desc'
        const path = parts.join('.')

        set(tableQueryOptions, `orderBy.${path}`, direction)
      }

      // Filtering
      const filterObj: IItem = {}
      set(filterObj, col.field, {})
      const filters = params.getAll(String(col.field))
      isUrlUsedForFiltering = isUrlUsedForFiltering || filters.length > 0

      filters.forEach(filter => {
        const [comparator, value] = filter.split('.')

        if (comparator === 'mode' && value === 'insensitive') {
          return
        }

        const currentFilterValue = get(filterObj, col.field)

        merge(currentFilterValue, {
          [comparator]: parseParamValue(
            value,
            comparator as ComparatorEnum,
            col
          ),
        })
      })

      if (!isEmpty(get(filterObj, col.field))) {
        merge(tableQueryWhere, filterObj)
      }
    })

    if (isUrlUsedForFiltering) {
      urlUsedFor.push('filter')
    }

    // Searching
    const search = params.get('search')

    if (search) {
      Object.assign(tableQueryOptions, { search })
    }

    return {
      options: tableQueryOptions,
      where: tableQueryWhere,
      usedFor: urlUsedFor,
    }
  }

  /**
   * Modifies the columns based on the search params
   *
   * Note: Mutates the inputs!
   */
  function modifyWithSearchParams(
    columnsRef: MaybeRefOrGetter<TableColumn[]>,
    tableState: Ref<ITableState>,
    currentPageRef: Ref<number>,
    currentPageSizeRef: Ref<number>
  ) {
    const columns = toValue(columnsRef)
    const tableQuery = transformUrlSearchParams(columns)
    const tableStateDefault = getTableStateDefault()

    if (!tableQuery.usedFor.length) {
      return
    }

    const { skip, take } = tableQuery.options

    // Pagination
    if (tableQuery.usedFor.includes('pagination')) {
      const page =
        (skip ?? tableStateDefault.page) /
          (take ?? tableStateDefault.pageSize) +
        1

      currentPageRef.value = Math.floor(page)
      currentPageSizeRef.value = take || tableStateDefault.pageSize
    }

    if (
      tableQuery.usedFor.includes('sort') ||
      tableQuery.usedFor.includes('filter')
    ) {
      columns.forEach(col => {
        // Sorting
        const sort = get(tableQuery.options.orderBy || {}, col.field)
        col.sort =
          typeof sort === 'string' ? (sort === 'asc' ? 1 : -1) : undefined

        // Filtering
        col.filters = []
        const filter = get(tableQuery.where, col.field)

        if (filter) {
          Object.entries(filter).forEach(([comparator, value]) => {
            col.filters!.push(
              new FilterItem({
                field: col.field,
                comparator: comparator as ComparatorEnum,
                compareValue: value,
              })
            )
          })
        }
      })
    }

    tableState.value.columns = extractColumnsStateData(columns)
  }

  function hasVisibleCol(columns: TableColumn[]) {
    return columns.some(col => !col.hidden)
  }

  return {
    storageKey, // Is not reactive!
    hasVisibleCol,
    getRowKey,
    getDistinctDataForField,
    extractColumnsStateData,
    getAvailableComparators,
    getInputByDataType,
    isSelectorComparator,
    transformUrlSearchParams,
    modifyWithSearchParams,
  }
}
