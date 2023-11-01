import { type CSSProperties } from 'vue'
import { type Required } from 'utility-types'
import { config } from '~/config'

// Types
import type { DistinctData } from '~/components/Table/types/distinct-data.type'
import type { IItem, IItemBase } from '~/libs/App/types/item.type'
import type { ITableOrderBy } from '~/components/Table/types/table-query.type'

// Models
import { FilterItem } from '~/libs/App/data/models/filter-item'
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// Constants
import { DATE_TYPES } from '~/libs/App/types/datetime.type'
import { useRenderTemporaryTableCell } from '~/components/Table/functions/useRenderTemporaryTableCell'

// Store

export class TableColumn<T = IItem> implements IItemBase<T> {
  name: string | Extract<keyof T, string | number>
  format?: (row: T, value?: any) => any
  dataType: DataType = 'string'
  label: string
  width: number | string = 1
  align: 'left' | 'center' | 'right' = 'left'
  field: Extract<keyof T, string | number>
  hideLabel?: boolean
  noFilters?: boolean
  filterable = true
  reorderable = true
  resizable = true
  sortable = true
  searchable?: boolean

  /**
   * When true, the column will be hidden in the table
   */
  hidden?: boolean

  /**
   * When true, the column will not be present in the column selection and will not
   * be generally accessible
   * It will also be hidden!
   */
  nonInteractive?: boolean

  /**
   * The column's original width
   */
  originalWidth: number | string = 1

  /**
   * When true, the column will always be included in the `select` query
   */
  alwaysSelected = false

  /**
   * When provided, the table will automatically create a link to the provided route
   */
  link?: (row: T) => string | undefined | false

  /**
   * The column's minimum width in px
   */
  minWidth?: number

  /**
   * In cases we use chips or any other custom components,
   * we might need to adjust the width that autofit calculates
   */
  autofitAdjustment = 0

  /**
   * When true, the column cannot be frozen
   */
  noFreeze?: boolean

  /**
   * Frozen columns are columns that are always visible
   */
  frozen?: boolean

  /**
   * If column is `semiFrozen` it means that it is not directly frozen but
   * it is part of a group of columns that are "before" the frozen column
   */
  semiFrozen?: boolean

  // FILTERING
  filters: FilterItem<T>[] = []

  /**
   * For some comparators, we should be using a specific component
   *
   * For example, when using `in` or `not.in` we should use a multi-select
   * with autocompletion and stuff
   */
  filterComponent?: {
    component: any
    props?: Record<string, any>
    comparators: ComparatorEnum[]
    valueFormatter?: {
      getter: (value: any) => any
      setter: (value: any) => void
    }
  }

  /**
   * The initial comparator
   */
  comparator = ComparatorEnum.STARTS_WITH

  /**
   * If used, these will be the only available comparators
   */
  comparators?: ComparatorEnum[]

  /**
   * These are comparators that will be added to the default ones
   */
  extraComparators?: ComparatorEnum[]

  /**
   * When filtering in the filter dropdown, we can use different formatting than in the table
   */
  filterFormat?: (row: T) => string | number

  /**
   * Whether to sort options in the filter dropdown
   */
  noFilterSort = false

  clearFilters() {
    this.filters = this.filters.filter(filter => !!filter.nonInteractive)
  }

  /**
   * Miscellanous data that can be used for anything
   */
  misc?: Record<string, any>

  get filterDbQuery() {
    if (!this.filters.length) {
      return undefined
    }

    // Filter must have a comparator and value to be considered valid
    const validFilters = this.filters.filter(filter => {
      if (Array.isArray(filter.value)) {
        return filter.comparator && filter.value.length
      }
      const isNonValueComparator = NON_VALUE_COMPARATORS.includes(
        filter.comparator
      )

      return filter.comparator && (!isNil(filter.value) || isNonValueComparator)
    })

    if (!validFilters.length) {
      return undefined
    }

    return validFilters
  }

  get filteredKeys() {
    return this.filters.reduce((agg, filter) => {
      Object.assign(agg, filter.filteredKeys)

      return agg
    }, {})
  }

  // Sorting
  sort?: 'asc' | 'desc'
  sortOrder?: number

  /**
   * When merging columns from the state and the original table columns,
   * the state columns order should be preserved, this is used for that
   */
  _internalSort?: number

  /**
   * When sorting in the filter dropdown, we can use different formatting than in the table
   */
  sortFormat?: (row: T) => string | number | boolean

  get sortDbQuery(): ITableOrderBy | undefined {
    if (!this.sort) {
      return undefined
    }

    return {
      field: this.field.toString(),
      direction: this.sort,
      sortOrder: this.sortOrder,
    }
  }

  /**
   * Function to get distinct data for the filter dropdown
   * Usage: For getting distinct values from the server
   */
  getDistinctData?: (
    col: TableColumn<T>
  ) => Promise<DistinctData[]> | DistinctData[]

  // Styling
  style: CSSProperties = {}
  classes?: ClassType
  headerStyle: CSSProperties = {}
  headerClasses?: ClassType
  totalsStyle: CSSProperties = {}
  totalsClasses?: ClassType

  // Helpers
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

  setDataType(dataType?: DataType, defaultComparator?: ComparatorEnum) {
    this.dataType = dataType || 'string'
    const _dataType = this.dataType?.replace('Simple', '')

    switch (_dataType) {
      case 'number':
      case 'int':
      case 'long':
      case 'double':
      case 'datetime':
      case 'DateTime':
      case 'date':
        this.comparator = defaultComparator ?? ComparatorEnum.EQUAL

        break

      case 'boolean':
      case 'bool':
        this.comparator = defaultComparator ?? ComparatorEnum.IS

        break

      default:
        this.comparator = defaultComparator ?? ComparatorEnum.STARTS_WITH

        break
    }
  }

  async autoFit(rows: any[], slotRenderFnc?: Function, tableMinColWidth = 80) {
    if (!this.resizable) {
      return
    }

    const { getCellWidth } = useRenderTemporaryTableCell()

    // We get the row with the maximum content
    const maxContentRow = (rows || [])
      .slice(0, config.table.columnAutoFit.rowsLimit)
      .reduce(
        (agg, row) => {
          const cellValue = get(row, this.field)
          const cellFormattedValue = this.format?.(row, cellValue) || cellValue

          const labelChars = String(cellFormattedValue || '').length

          if (labelChars > agg.labelChars || !agg.labelChars) {
            agg.labelChars = labelChars
            agg.row = row
          }

          return agg
        },
        { labelChars: 0, row: undefined } as Record<string, any>
      )

    const maxContentWidth = await getCellWidth(
      maxContentRow.row,
      this,
      slotRenderFnc
    )

    const labelChars = this._label.length
    const CELL_PADDING = 12
    const colMinWidth = Math.min(
      Math.max(
        tableMinColWidth,
        this.minWidth || 0,
        config.table.columnAutoFit.considerHeader ? labelChars * 8 + 40 : 0, // These numbers are pretty arbitrary
        maxContentWidth + CELL_PADDING
      ),
      config.table.columnAutoFit.maxColumnWidthChars * 6 + 20 // When autofitting, we don't want to go over some predefined value
    )

    this.setWidth(colMinWidth)
  }

  freeze(columns: TableColumn[]) {
    const isFrozen = this.frozen

    // We unfreeze any other frozen column
    columns.forEach(col => {
      col.frozen = false
      col.semiFrozen = false
      col.headerStyle = omit(this.headerStyle, [
        'left',
        'position',
        'backgroundColor',
        'zIndex',
      ])
      col.style = omit(this.style, [
        'left',
        'position',
        'backgroundColor',
        'zIndex',
      ])
    })

    if (!isFrozen) {
      // And we freeze the current column
      const colIdx = columns.findIndex(col => col.field === this.field)

      let left = 0
      columns.slice(0, colIdx + 1).forEach(col => {
        col.setWidth(col.adjustedWidth)

        col.semiFrozen = true
        col.headerStyle = {
          ...col.headerStyle,
          left: `${left}px`,
          position: 'sticky',
          backgroundColor: 'var(--color-theme)',
          zIndex: 1,
        }
        col.style = {
          ...col.style,
          left: `${left}px`,
          position: 'sticky',
          backgroundColor: 'var(--color-theme)',
          zIndex: 1,
        }

        left += col.adjustedWidth
      })

      this.frozen = true
    }
  }

  constructor(col: Required<Partial<TableColumn<T>>, 'field'>) {
    this.name = col.name ?? col.field
    this.format = col.format
    this.filterable = col.filterable ?? true
    this.dataType = col.dataType ?? this.dataType
    this.label = String(col.label || col.name)
    this.field = col.field
    this.width = col.width || this.width
    this.originalWidth = col.width || this.width
    this.minWidth = col.minWidth
    this.align = col.align || this.align
    this.hideLabel = col.hideLabel
    this.noFilters = col.noFilters
    this.sortable = col.sortable ?? true
    this.searchable = col.searchable ?? false
    this.hidden = col.hidden ?? false
    this.alwaysSelected = col.alwaysSelected ?? false
    this.nonInteractive = col.nonInteractive ?? false
    this.autofitAdjustment = col.autofitAdjustment ?? 0
    this.link = col.link
    this.noFreeze = col.noFreeze

    // We also hide the column when it's non-interactive
    if (col.nonInteractive) {
      this.hidden = true
    }

    this.isHelperCol = col.isHelperCol ?? this.isHelperCol

    // Filtering
    this.filters = col.filters ? col.filters : []
    this.filterComponent = col.filterComponent
    this.comparators = col.comparators
    this.extraComparators = col.extraComparators
    this.noFilterSort = col.noFilterSort ?? false
    this.filterFormat = col.filterFormat
    this.getDistinctData = col.getDistinctData

    this.reorderable = col.reorderable ?? this.reorderable
    this.resizable = col.resizable ?? this.resizable

    this.setDataType(col.dataType, col.comparator)

    // Sorting
    this.sort = col.sort
    this.sortOrder = col.sortOrder
    this.sortFormat = col.sortFormat
    this._internalSort = col._internalSort

    if (DATE_TYPES.includes(this.dataType) && !this.sortFormat) {
      this.sortFormat = (row: T) => {
        return getDateSimpleValue(row[this.field as keyof T] as Datetime)
      }
    }

    // Styling
    this.style = col.style || this.style
    this.classes = col.classes
    this.headerStyle = col.headerStyle || this.headerStyle
    this.headerClasses = col.headerClasses
    this.totalsStyle = col.totalsStyle || this.totalsStyle
    this.totalsClasses = col.totalsClasses || 'flex-center'

    this.misc = col.misc
  }
}
