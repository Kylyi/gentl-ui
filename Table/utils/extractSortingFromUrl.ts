import { TableColumn } from '~/components/Table/models/table-column.model'

/**
 * Extracts `sorting` from the URL
 * The URL might look like: `?order=(name.value.asc,id.desc)`
 */
export function parseSortingFromUrl(
  params: URLSearchParams
): Array<Pick<TableColumn, 'field' | 'sort' | 'sortOrder'>> {
  const sort = params.get('order')

  if (!sort) {
    return []
  }

  let trimmedSort = sort
  trimmedSort = trimmedSort?.replace(/[()]/g, '') // Remove the brackets

  const sortFields = trimmedSort?.split(',') ?? []

  let sortOrder = 1
  const sorting = sortFields.reduce((agg, sortField) => {
    const fieldSplit = sortField.split('.')
    const direction = fieldSplit.pop() as 'asc' | 'desc'
    const fieldPath = fieldSplit.join('.')

    if (direction === 'asc' || direction === 'desc') {
      agg.push({
        field: fieldPath,
        sort: direction,
        sortOrder: sortOrder++,
      })
    }

    return agg
  }, [] as { field: string; sort: 'asc' | 'desc'; sortOrder: number }[])

  return sorting
}
