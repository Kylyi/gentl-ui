import type { Required } from 'utility-types'

export class TableGroup<T = IItem> {
  dataType: ExtendedDataType = 'string'
  field: ObjectKey<T>
  resolver?: string
  sort: 'asc' | 'desc' = 'asc'

  constructor(obj: Required<Partial<TableGroup<T>>, 'field'>) {
    this.field = obj.field
    this.dataType = obj.dataType || this.dataType
    this.resolver = obj.resolver
    this.sort = obj.sort || this.sort
  }
}
