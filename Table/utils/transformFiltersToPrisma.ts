import { klona } from 'klona'

// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { ITableFilterRow } from '~/components/Table/types/table-query.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'
import { FilterItem } from '~/libs/App/data/models/filter-item'

const { traverseChildren } = useTraversing()

function possiblyTransformToID(value: any) {
  if (typeof value === 'string') {
    // Check if the string can be converted to a number
    const numericValue = Number.parseFloat(value)

    if (!Number.isNaN(numericValue)) {
      // If it's a valid number, check its length
      const valueAsString: string = numericValue.toString()

      if (valueAsString.length === 9) {
        return numericValue
      }
    }
  }

  return value
}

/**
 * Transforms the filter row to Prisma's where condition format.
 */
function transformItemToPrismaCondition(
  item: IQueryBuilderItem | FilterItem<any>
): any {
  switch (item.comparator) {
    case ComparatorEnum.EQUAL:
      // Date datatype needs special treatment
      if (/^\d{4}-\d{2}-\d{2}$/.test(item.value)) {
        return {
          [item.field]: {
            gte: $date(item.value).startOf('day'),
            lte: $date(item.value).endOf('day'),
          },
        }
      }

      // TODO: This should be done in transforming the URL to the filters, not here!
      return { [item.field]: possiblyTransformToID(item.value) }

    case ComparatorEnum.NOT_EQUAL:
      // Date datatype needs special treatment
      if (/^\d{4}-\d{2}-\d{2}$/.test(item.value)) {
        return {
          [item.field]: {
            not: {
              gte: $date(item.value).startOf('day'),
              lte: $date(item.value).endOf('day'),
            },
          },
        }
      }

      return { [item.field]: { not: possiblyTransformToID(item.value) } }

    case ComparatorEnum.IN:
      return {
        [item.field]: {
          in: item.value.map((id: any) => possiblyTransformToID(id)),
        },
      }

    case ComparatorEnum.NOT_IN:
      return {
        [item.field]: {
          not: {
            in: item.value.map((id: any) => possiblyTransformToID(id)),
          },
        },
      }

    case ComparatorEnum.LIKE:
    case ComparatorEnum.CONTAINS:
      return { [item.field]: { contains: item.value } }

    case ComparatorEnum.STARTS_WITH:
      return { [item.field]: { startsWith: item.value } }

    case ComparatorEnum.ENDS_WITH:
      return { [item.field]: { endsWith: item.value } }

    case ComparatorEnum.NOT_LIKE:
    case ComparatorEnum.NOT_CONTAINS:
      return { [item.field]: { not: { contains: item.value } } }

    case ComparatorEnum.NOT_STARTS_WITH:
      return { [item.field]: { not: { startsWith: item.value } } }

    case ComparatorEnum.NOT_ENDS_WITH:
      return { [item.field]: { not: { endsWith: item.value } } }

    case ComparatorEnum.GREATER_THAN:
      return { [item.field]: { gt: item.value } }

    case ComparatorEnum.LESS_THAN:
      return { [item.field]: { lt: item.value } }

    case ComparatorEnum.GREATER_THAN_OR_EQUAL:
      return { [item.field]: { gte: item.value } }

    case ComparatorEnum.LESS_THAN_OR_EQUAL:
      return { [item.field]: { lte: item.value } }

    case ComparatorEnum.IS_EMPTY:
      return { [item.field]: null }

    case ComparatorEnum.NOT_IS_EMPTY:
      return { [item.field]: { not: null } }

    case ComparatorEnum.IS:
      return {
        [item.field]: typeof item.value === 'boolean' ?? item.value === 'true',
      }

    case ComparatorEnum.NOT_IS:
      return {
        [item.field]: {
          not: typeof item.value === 'boolean' ?? item.value === 'true',
        },
      }

    case ComparatorEnum.AGO:
    case ComparatorEnum.UNTIL:
      // TODO: Implement
      throw new Error(
        `Date-based comparators like 'AGO' and 'UNTIL' need custom logic`
      )

    case ComparatorEnum.NOT_AGO:
    case ComparatorEnum.NOT_UNTIL:
      // TODO: Implement
      throw new Error(
        `Negative date-based comparators like 'NOT_AGO' and 'NOT_UNTIL' need custom logic`
      )

    default:
      throw new Error(`Unsupported comparator: ${item.comparator}`)
  }
}

/**
 * Transform rows to Prisma's where clause format.
 */
export function transformToPrismaWhere(options: {
  rows?: Array<ITableFilterRow | IQueryBuilderRow> | undefined
}): any {
  const { rows } = options || {}

  if (!rows) {
    return {}
  }

  const rowsClone = klona(rows)
  const where: Record<string, any> = {}

  traverseChildren(rowsClone, (parentNode, node) => {
    if ('isGroup' in node) {
      if (!parentNode) {
        set(where, node.condition, [])
        node.parentX = get(where, node.condition)
      } else {
        const idx = node.path.split('.').pop()
        set(parentNode.parentX, idx, {
          [node.condition]: [],
        })
        node.parentX = get(parentNode.parentX, `${idx}.${node.condition}`)
      }
    } else {
      const idx = node.path.split('.').pop()
      set(
        parentNode!.parentX,
        `${idx}`,
        transformItemToPrismaCondition(
          node as IQueryBuilderItem | FilterItem<any>
        )
      )
    }
  })

  return where
}
