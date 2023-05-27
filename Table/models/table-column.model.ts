import { Required } from 'utility-types'
import { CSSProperties } from 'vue'

// TYPES
import type { DistinctData } from '~/components/Table/types/distinct-data.type'
import type { IItem, IItemBase } from '~/libs/App/types/item.type'

// MODELS
import { FilterItem } from '~/libs/App/data/models/filter-item'

// CONSTANTS
import { DATE_TYPES } from '~/libs/App/types/datetime.type'

export class TableColumn<T = IItem>
  extends FilterItem<T>
  implements IItemBase<T>
{
  name: string | Extract<keyof T, string | number>
  format?: (row: T, value?: any) => any
  dataType: DataType = 'string'
  label: string
  width: number | string = 1
  minWidth?: string
  align: 'left' | 'center' | 'right' = 'left'
  field: Extract<keyof T, string | number>
  hideLabel?: boolean
  hideFilters?: boolean
  filterable = true
  sortable = true
  searchable?: boolean

  // FILTERING
  /**
   * When filtering in the filter dropdown, we can use different formatting than in the table
   */
  filterFormat?: (row: T) => string | number

  /**
   * Custom filtering function
   */
  filterFnc?: (row: T) => boolean

  // Whether to sort options in the filter dropdown
  noFilterSort = false

  // SORTING
  sort?: -1 | 0 | 1
  sortOrder?: number

  /**
   * When sorting in the filter dropdown, we can use different formatting than in the table
   */
  sortFormat?: (row: T) => string | number | boolean

  get sortDbQuery(): Record<string, 'asc' | 'desc'> | undefined {
    if (!this.sort) {
      return undefined
    }

    const query: Record<string, any> = {}
    set(query, this.field, this.sort === 1 ? 'asc' : 'desc')

    return query
  }

  /**
   * Function to get distinct data for the filter dropdown
   * Usage: For getting distinct values from the server
   */
  getDistinctData?: (
    col: TableColumn<T>
  ) => Promise<DistinctData[]> | DistinctData[]

  // STYLING
  style: CSSProperties = {}
  classes?: ClassType
  headerStyle: CSSProperties = {}
  headerClasses?: ClassType

  // HELPERS
  isHelperCol = false // Helper cols are non-data columns like group actions
  adjustedWidth = 1 // Is calculated, not set by user

  get _label() {
    return this.hideLabel ? '' : this.label
  }

  get adjustedWidthPx() {
    return `${this.adjustedWidth}px`
  }

  setWidth(width: number) {
    this.width = `${width}px`
    this.adjustedWidth = width
  }

  constructor(col: Required<Partial<TableColumn<T>>, 'field'>) {
    super(col)

    this.name = col.name ?? col.field
    this.format = col.format
    this.filterable = col.filterable ?? true
    this.dataType = col.dataType ?? this.dataType
    this.label = String(col.label || col.name)
    this.field = col.field
    this.width = col.width || this.width
    this.minWidth = col.minWidth
    this.align = col.align || this.align
    this.hideLabel = col.hideLabel
    this.hideFilters = col.hideFilters
    this.sortable = col.sortable ?? true
    this.searchable = col.searchable ?? false

    this.isHelperCol = col.isHelperCol ?? this.isHelperCol

    // FILTERING
    this.noFilterSort = col.noFilterSort ?? false
    this.filterFormat = col.filterFormat
    this.filterFnc = col.filterFnc
    this.getDistinctData = col.getDistinctData

    // SORTING
    this.sort = col.sort
    this.sortOrder = col.sortOrder
    this.sortFormat = col.sortFormat

    if (DATE_TYPES.includes(this.dataType) && !this.sortFormat) {
      this.sortFormat = (row: T) => {
        return getDateSimpleValue(row[this.field as keyof T] as Datetime)
      }
    }

    // STYLING
    this.style = col.style || this.style
    this.classes = col.classes
    this.headerStyle = col.headerStyle || this.headerStyle
    this.headerClasses = col.headerClasses
  }
}
