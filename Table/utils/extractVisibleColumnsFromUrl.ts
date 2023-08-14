/**
 * Extracts the visible columns (and their order) from the URL
 * The URL might look like: `?select=name.value,id,description`
 */
export function parseVisibleColumnsFromUrl(params: URLSearchParams) {
  const select = params.get('select')

  if (!select) {
    return []
  }

  const selectFields = select?.split(',') ?? []

  return selectFields
}
