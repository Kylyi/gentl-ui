import type { ITableQuery } from '~/components/Table/types/table-query.type'

export function transformToPrismaSelect(select?: ITableQuery['select']) {
  if (!select) {
    return undefined
  }

  const transformedSelect: Record<string, any> = {}

  for (const field of select) {
    set(transformedSelect, field, true)
  }

  return transformedSelect
}
