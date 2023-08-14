import { isDayjs } from 'dayjs'

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
  filters: ITableQuery['filter'] | ITableQuery['queryBuilder']
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
        if (isDayjs(item.value)) {
          val = item.value.format('YYYY-MM-DD')
        }

        // Array
        if (Array.isArray(item.value)) {
          val = item.value.join(',')
        }

        return `${item.field}.${item.comparator}.${val}`
      }
    })
    .join(',')
}

/**
 * Serializes the table's `orderBy` into a `order` query parameter.
 */
export function serializeOrderByString(
  orderBy: ITableQuery['orderBy']
): string {
  if (!orderBy) {
    return ''
  }

  return orderBy
    .map(sort => {
      return `${sort.field}.${sort.direction}`
    })
    .join(',')
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
  const { filter, orderBy, select } = tableQuery

  const urlParams = new URLSearchParams()

  if (filter?.length) {
    urlParams.append('filter', serializeFilterString(filter))
  }

  if (orderBy?.length) {
    urlParams.append('order', `(${serializeOrderByString(orderBy)})`)
  }

  if (select?.length) {
    urlParams.append('select', serializeSelectString(select))
  }

  return urlParams
}
