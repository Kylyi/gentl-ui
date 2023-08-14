/**
 * Extracts `sorting` from the URL
 * The URL might look like: `?order=(name.value.asc,id.desc)`
 * Note: The field can be nested ~ with multiple dots
 */
export function parseSortingFromUrl(params: URLSearchParams) {
  const sort = params.get('order')

  if (!sort) {
    return []
  }

  const trimmedSort = sort?.replace(/[()]/g, '') // Remove the brackets
  const sortFields = trimmedSort?.split(',') ?? []

  let sortOrder = 0
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
