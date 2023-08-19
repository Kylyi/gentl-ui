import { TableColumn } from 'components/Table/models/table-column.model'

// Types
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

const AND_CONDITION = 'AND'
const OR_CONDITION = 'OR'

// Temporary variables
let columnsByField: Record<string, TableColumn<any>> = {}

/**
 * Will generate the appropriate path for the current row
 * The result will look like this: `0.children.1.children.2`
 */
function generatePath(parentPath: string, idx: number): string {
  return parentPath ? `${parentPath}.children.${idx}` : `${idx}`
}

/**
 * Extract the filter query parameter from URLSearchParams.
 * the `fromSchema` parameter should be used when we provide URLSearchParams
 * from the table layout schema, not from the actual URL
 */
function extractFilterFromSearchParams(
  searchParams: URLSearchParams,
  key = 'filters',
  fromSchema?: boolean
): string | null {
  const paramsString = searchParams.get(key)

  if (!paramsString) {
    return null
  }

  if (fromSchema) {
    if (paramsString.startsWith('(') && paramsString.endsWith(')')) {
      return paramsString.slice(1, -1)
    }
  }

  return paramsString
}

/**
 * Check if the filter string at the curr\ent index represents a group condition.
 */
function isGroupCondition(filterStr: string, idx: number): boolean {
  return (
    filterStr.startsWith(AND_CONDITION.toLowerCase(), idx) ||
    filterStr.startsWith(OR_CONDITION.toLowerCase(), idx)
  )
}

/**
 * Parse a group segment from the filter string.
 */
function parseGroupSegment(
  filterStr: string,
  idx: number,
  results: IQueryBuilderRow[],
  parentPath: string = ''
): number {
  const condition = filterStr[idx] === 'a' ? AND_CONDITION : OR_CONDITION
  const conditionEndIdx = idx + condition.length

  let openBrackets = 1
  let closeIdx = conditionEndIdx + 1

  while (openBrackets !== 0) {
    if (filterStr[closeIdx] === '(') {
      openBrackets++
    } else if (filterStr[closeIdx] === ')') {
      openBrackets--
    }

    closeIdx++
  }

  const groupContent = filterStr.slice(conditionEndIdx + 1, closeIdx - 1)
  const path = generatePath(parentPath, results.length)
  const group: IQueryBuilderGroup = {
    id: generateUUID(),
    path,
    condition,
    children: [],
    isGroup: true,
  }

  // We insert the group into the parent group if there is any parent
  if (parentPath) {
    const segments = path.split('.')
    const lastSegment = segments.pop()
    const parentGroup: any = get(results, segments.join('.'))

    if (lastSegment === 'children') {
      parentGroup.children.push(group)
    } else {
      results.push(group)
    }
  }

  // Otherwise, we insert the group into the results
  else {
    results.push(group)
  }

  parseFilterString(groupContent, group.children, path)

  return closeIdx
}

/**
 * Parse an item segment from the filter string.
 */
function parseItemSegment(
  filterStr: string,
  idx: number,
  results: IQueryBuilderRow[],
  parentPath: string = ''
): number {
  // Arrays are inserted into parentheses, therefore, we need to be aware
  // of the parentheses depth to know when the segment ends
  let parenthesesDepth = 0
  let endIdx = -1

  for (let i = idx; i < filterStr.length; i++) {
    if (filterStr[i] === '(') {
      parenthesesDepth++
    } else if (filterStr[i] === ')') {
      parenthesesDepth--
    } else if (filterStr[i] === ',' && parenthesesDepth === 0) {
      endIdx = i
      break
    }
  }

  const segment =
    endIdx === -1 ? filterStr.slice(idx) : filterStr.slice(idx, endIdx)

  const comparatorKeys = Object.values(ComparatorEnum).sort(
    (a, b) => b.length - a.length
  )
  let foundComparator: ComparatorEnum | null = null

  for (const comparator of comparatorKeys) {
    if (segment.includes(`.${comparator}.`)) {
      foundComparator = comparator as ComparatorEnum

      break
    }
  }

  if (!foundComparator) {
    throw new Error(`No valid comparator found in segment: ${segment}`)
  }

  const [field] = segment.split(`.${foundComparator}.`)
  const value = segment.slice(segment.lastIndexOf('.') + 1)

  // We check for arrays to parse each value in the array
  const isArray = value.startsWith('(') && value.endsWith(')')
  const parsedValue = isArray
    ? value
        .slice(1, -1)
        .split(',')
        .map(val => parseValue(val, columnsByField[field]?.dataType))
    : parseValue(value, columnsByField[field]?.dataType)

  const path = generatePath(parentPath, results.length)
  const item: IQueryBuilderItem = {
    id: generateUUID(),
    path,
    field,
    comparator: foundComparator,
    value: parsedValue,
  }

  results.push(item)

  return endIdx === -1 ? filterStr.length : endIdx + 1
}

/**
 * Recursively parse the filter string into structured data.
 */
export function parseFilterString(
  filterStr: string,
  results: IQueryBuilderRow[] = [],
  parentPath: string = ''
): IQueryBuilderRow[] {
  let idx = 0

  while (idx < filterStr.length) {
    if (isGroupCondition(filterStr, idx)) {
      idx = parseGroupSegment(filterStr, idx, results, parentPath)
      // If next character is not '(' or end of string, assume it's a new segment.
      if (
        idx < filterStr.length &&
        filterStr[idx] !== ',' &&
        filterStr[idx] !== '('
      ) {
        idx = parseItemSegment(filterStr, idx, results, parentPath)
      }
    } else {
      idx = parseItemSegment(filterStr, idx, results, parentPath)
      // Handle the case when there's no comma between segments.
      if (idx < filterStr.length && filterStr[idx] !== ',') {
        idx--
      }
    }

    if (idx < filterStr.length && filterStr[idx] === ',') {
      idx++
    }
  }
  return results
}

/**
 * Parses the filter query parameter from URLSearchParams into structured data.
 * the `fromSchema` parameter should be used when we provide URLSearchParams
 * from the table layout schema, not from the actual URL
 */
export function parseFiltersFromUrl(options: {
  searchParams: URLSearchParams
  key?: string
  columns?: TableColumn<any>[]
  fromSchema?: boolean
}): IQueryBuilderRow[] {
  const { searchParams, key = 'filters', columns = [], fromSchema } = options

  // We save the columns in a temporary variable
  columnsByField = columns.reduce((agg, col) => {
    agg[col.field] = col

    return agg
  }, {} as Record<string, TableColumn<any>>)

  const filterQuery = extractFilterFromSearchParams(
    searchParams,
    key,
    fromSchema
  )

  return filterQuery ? parseFilterString(filterQuery) : []
}
