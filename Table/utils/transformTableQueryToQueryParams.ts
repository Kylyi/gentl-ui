import dayjs from 'dayjs'

// Types
import {
  ITableFilterGroup,
  ITableFilterItem,
  ITableQuery,
} from 'components/Table/types/table-query.type'

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

        // We check if the group has any children, otherwise we return an empty string
        // if (!group.children.length) {
        //   return undefined
        // }

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
  const { filters, orderBy, select, fetchMore } = tableQuery

  const urlParams = new URLSearchParams()

  // Filters
  if (filters?.length) {
    // We remove empty groups
    const _filtersTrimmed = serializeFilterString(filters).replace(
      /and\(\)|and\(\)|or\(\)|or\(\)/g,
      ''
    )

    if (_filtersTrimmed.length) {
      urlParams.append('and', `(${_filtersTrimmed})`)
    }
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

  // Visible columns
  if (select?.length) {
    urlParams.append('select', serializeSelectString(select))
  }

  return urlParams
}
