import { ITableOrderBy } from '~/components/Table/types/table-query.type'

/**
 * Transforms the sorting to Prisma's `orderBy` format.
 */
export function transformSortingToPrismaOrderBy(
  orderBy?: ITableOrderBy[] | undefined
) {
  if (!orderBy) {
    return undefined
  }

  return orderBy.map(item => {
    return {
      [item.field]: item.direction,
    }
  })
}
