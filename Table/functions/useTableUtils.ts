// TYPES
import { DistinctData } from '~/components/Table/types/distinct-data.type'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

export function useTableUtils() {
  async function getDistinctDataForField<T>(
    col: TableColumn<T>,
    query: Function,
    options: {
      includeDeleted?: boolean
      mapKey?: string
      where?: any
      field?: string
    } = {}
  ): Promise<DistinctData[]> {
    const { includeDeleted = false, mapKey = 'distinctData', field } = options
    const distinctField = [field || col.field]

    const res = await query({
      includeDeleted,
      distinct: distinctField,
      where: options.where,
    })
    const data = get(res, mapKey)

    return data.map((item: any) => ({
      ...item,
      _value: get(item, field || col.field),
    }))
  }

  function stripColumnsStateData(column: TableColumn[]) {
    return column.map(col => {
      const { width, comparator, compareValue, sort, sortOrder } = col

      return {
        field: col.field,
        width,
        comparator,
        compareValue,
        sort,
        sortOrder,
      }
    })
  }
  return {
    getDistinctDataForField,
    stripColumnsStateData,
  }
}
