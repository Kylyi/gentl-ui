/**
 * Extracts `sorting` from the URL
 * The URL might look like: `?order=(name.value.asc,id.desc)`
 * @param options.fromSchema should be used when we provide URLSearchParams from
 * the table layout schema, not from the actual URL
 * Note: The field can be nested ~ with multiple dots
 */
export function parseSortingFromUrl(
  params: URLSearchParams,
  options?: { fromSchema?: boolean }
) {
  const { fromSchema } = options ?? {}

  const sort = fromSchema ? params.get('paging') : params.get('order')

  if (!sort) {
    return []
  }

  let trimmedSort = sort

  // When using through schema, it starts with `sort`, we need to remove it
  const match = trimmedSort.match(/\(sort\(([^)]+)\)/)

  if (match && match[1]) {
    trimmedSort = match[1]
  }

  trimmedSort = trimmedSort?.replace(/[()]/g, '') // Remove the brackets
  const sortFields = trimmedSort?.split(',') ?? []

  let sortOrder = 1
  const sortObj = sortFields.reduce((agg, sortField) => {
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

  return sortObj
}
