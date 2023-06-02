import { FuseOptions } from '@vueuse/integrations'
import { TableColumn } from '~/components/Table/models/table-column.model'

export interface ITableProps {
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'inf'
  columns: TableColumn<any>[]
  fuseOptions?: FuseOptions<any>
  groupExpandWidth?: number
  groupRowHeight?: number
  totalRows?: number
  headerHeight?: number
  hideFilters?: boolean
  hideHeader?: boolean
  infiniteScroll?: boolean
  loading?: boolean
  loadingOnTop?: boolean
  minimumColumnWidth?: number
  mobileRowHeight?: number
  noActions?: boolean
  noExport?: boolean
  noSearch?: boolean
  rowClickable?: boolean
  rowHeight?: number
  rowKey?: string
  rows?: any[]
  selectable?: boolean
  separator?: 'horizontal' | 'vertical' | 'cell'
  useIncludeDeleted?: boolean
  useWorker?: boolean

  /**
   * Function to get data for the table
   */
  getData?: {
    fnc: Function
    mapKey?: string
    countKey?: string
    createIdentifier?: (row: any, idx: number) => string | number
    errorHandler?: (error: any) => void
  }

  /**
   * Whether the table should handle the resize event - performance heavy(-ish)
   */
  autoResize?: boolean

  /**
   * Fuse keys
   */
  searchKeys?: string[]

  /**
   * Will split the table row into multiple columns
   * Usage: For mobile view
   */
  splitRow?: number

  /**
   * Used in RecycleScroller
   */
  sizeField?: string

  /**
   * Can be either
   * Array<string | number | item>
   * Record<itemKey, boolean | item>
   * itemKey
   */
  selected?: any

  /**
   * Key for the local storage
   */
  storageKey?: string

  /**
   * Whether to use chip-like filters
   */
  useChips?: boolean

  /**
   * Whether to use server-side pagination, filtering and sorting
   */
  useServer?: boolean
}
