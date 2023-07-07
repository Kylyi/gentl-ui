// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

export class TableColumnState {
  field: TableColumn['field']
  filters: TableColumn['filters']
  width?: TableColumn['width']
  sort?: TableColumn['sort']
  sortOrder?: number
  hidden?: boolean

  constructor(column: TableColumn) {
    this.field = column.field
    this.width = column.width
    this.filters = column.filters
    this.sort = column.sort
    this.sortOrder = column.sortOrder
    this.hidden = column.hidden
  }
}
