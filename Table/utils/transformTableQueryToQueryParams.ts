import dayjs from 'dayjs'

// Types
import {
type ITableFilterGroup,
type ITableFilterItem,
type ITableQuery,
} from '~/components/Table/types/table-query.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

/**
 * Serializes the table's `filter` into a `filter` query parameter.
 */
export function serializeFilterString(
  filters: ITableQuery['filters'] | ITableQuery['queryBuilder']
): string {
  if (!filters) {
    return ''
  }

  return filters
    .map(row => {
      if ((row as ITableFilterGroup).isGroup) {
        const group = row as ITableFilterGroup

        return `${group.condition.toLowerCase()}(${serializeFilterString(
          group.children
        )})`
      } else {
        const item = row as ITableFilterItem
        let val: string | number = item.value

        // Date
        if (dayjs.isDayjs(item.value)) {
          val = item.value.format('YYYY-MM-DD')
        }

        // Array
        if (Array.isArray(item.value)) {
          val = `(${item.value.join(',')})`
        }

        // Includes comma
        if (typeof item.value === 'string' && item.value.includes(',')) {
          val = `(${item.value})`
        }

        return val !== undefined
          ? `${item.field}.${item.comparator}.${val}`
          : `${item.field}.${item.comparator}`
      }
    })
    .join(',')
}

/**
 * Serializes the table's `orderBy` into a `order` query parameter.
 */
export function serializeOrderByString(
  orderBy: ITableQuery['orderBy'],
  fetchMore?: ITableQuery['fetchMore']
): string {
  if (!orderBy) {
    return ''
  }

  let orderByString = orderBy
    .map(sort => {
      if (fetchMore && sort.field === fetchMore.rowKey) {
        return `${sort.field}.${sort.direction}.${fetchMore.$key}`
      } else if (fetchMore) {
        const fieldValue = get(fetchMore.lastRow, sort.field)
        const val = fieldValue || (fieldValue === null ? '$null' : '$empty')

        return `${sort.field}.${sort.direction}.${val}`
      }

      return `${sort.field}.${sort.direction}`
    })
    .join(',')

  if (!orderBy.length && fetchMore) {
    orderByString += `${fetchMore.rowKey}.asc.${fetchMore.$key},$key.${fetchMore.$key}`
  } else if (fetchMore) {
    orderByString += `,$key.${fetchMore.$key}`
  }

  return orderByString
}

/**
 * Serializes the table's `select` into a `select` query parameter.
 */
export function serializeSelectString(select: ITableQuery['select']): string {
  if (!select) {
    return ''
  }

  return select.join(',')
}

export function serializeTableQueryToQueryParams(tableQuery: ITableQuery) {
  const { orderBy, select, fetchMore, queryBuilder, columnFilters } = tableQuery

  const urlParams = new URLSearchParams()

  // Query builder
  if (queryBuilder?.length) {
    // We remove empty groups
    let _queryBuilderTrimmed = serializeFilterString(queryBuilder)

    // Regular expression to match and() or or() substrings
    const regex = /and\(\)|or\(\)/g

    let prevResult: string
    do {
      prevResult = _queryBuilderTrimmed
      // Replace matched substrings with an empty string
      _queryBuilderTrimmed = _queryBuilderTrimmed.replace(regex, '')

      // To also remove consecutive commas resulting from the removal, use another regex replacement
      _queryBuilderTrimmed = _queryBuilderTrimmed.replace(/,+,/g, ',')

      // Remove trailing commas within parentheses
      _queryBuilderTrimmed = _queryBuilderTrimmed.replace(/,(?=\))/g, '')

      // If comma starts or ends the string, remove it.
      _queryBuilderTrimmed = _queryBuilderTrimmed.replace(/^,|,$/g, '')
    } while (prevResult !== _queryBuilderTrimmed) // Continue as long as changes are being made

    if (_queryBuilderTrimmed.length) {
      const firstBracket = _queryBuilderTrimmed.indexOf('(')
      const condition = _queryBuilderTrimmed.substring(0, firstBracket)
      const content = _queryBuilderTrimmed.substring(
        firstBracket + 1,
        _queryBuilderTrimmed.length - 1
      )

      urlParams.append(condition, `(${content})`)
    }
  }

  // Column filters
  if (columnFilters?.length) {
    columnFilters.forEach(filter => {
      // We don't need the value when using the ComparatorEnum.IS_EMPTY and ComparatorEnum.NOT_IS_EMPTY comparators
      const EMPTY_COMPARATORS = [
        ComparatorEnum.IS_EMPTY,
        ComparatorEnum.NOT_IS_EMPTY,
      ]

      if (EMPTY_COMPARATORS.includes(filter.comparator)) {
        urlParams.append(filter.field, filter.comparator)

        return
      }

      urlParams.append(filter.field, `${filter.comparator}.${filter.value}`)
    })
  }

  // Sorting
  // Should consist of max. 3 items:
  // 1. sort ~ (sort(field1.asc,field2.desc))
  //    When fetching more data, sorting may also include some extra params ~ $key.001
  //    It also transforms the sort in general... Why?? I don't know...
  // 2. limit ~ limit.100
  // 3. count ~ count.true

  const paging: string[] = [
    ...(orderBy?.length || fetchMore
      ? [`sort(${serializeOrderByString(orderBy, fetchMore)})`]
      : []),
    ...(tableQuery.take ? [`limit.${tableQuery.take}`] : []),
    ...(tableQuery.count ? ['count.true'] : []),
  ]
  urlParams.append('paging', `(${paging.join(',')})`)

  // Visible columns + sorted columns
  // We also check for the sorted columns because we need to know their values for `fetchMore`
  if (select?.length) {
    urlParams.append('select', serializeSelectString(select))
  }

  return urlParams
}
