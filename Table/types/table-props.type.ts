// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type {
  ITableDataFetchFncInput,
  ITableQuery,
} from '~/components/Table/types/table-query.type'
import type { ITableSelection } from '~/components/Table/types/table-selection.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

export interface ITableProps {
  /**
   * Whether the table should handle the resize event - performance heavy(-ish)
   */
  autoResize?: boolean

  /**
   * The breakpoint at which the table should switch to mobile view
   */
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'inf'

  /**
   * Definition of the table columns
   */
  columns?: TableColumn<any>[]

  /**
   * The default width for expand columns
   */
  groupExpandWidth?: number

  /**
   * The default height for grouped table row
   */
  groupRowHeight?: number

  /**
   * The total amount of rows
   */
  totalRows?: number

  /**
   * The default height for the table header
   */
  headerHeight?: number

  /**
   * Whether the column filters should be hidden
   */
  noFilters?: boolean

  /**
   * Whether the table header should be hidden
   */
  noHeader?: boolean

  /**
   * Basically the opposite of pagination
   */
  infiniteScroll?: boolean

  /**
   * Whether the table is in `loading` state
   */
  loading?: boolean

  /**
   * Whether the loading should be on top of the table
   */
  loadingOnTop?: boolean

  /**
   * The minimum column width
   */
  minimumColumnWidth?: number

  /**
   * The default row height in mobile view
   */
  mobileRowHeight?: number

  /**
   * Whether the tabe actions should be hidden
   */
  noActions?: boolean

  /**
   * Whether the export btn should be hidden
   */
  noExport?: boolean

  /**
   * Whether the pagination should be used
   */
  noPagination?: boolean

  /**
   * Whether the search should be hidden
   */
  noSearch?: boolean

  /**
   * Whether the top of the table should be hidden
   */
  noTop?: boolean

  /**
   * Whether the totals should be hidden
   */
  noTotals?: boolean

  /**
   * Query builder rows
   */
  queryBuilder?: IQueryBuilderRow[]

  /**
   * Whether the row should be clickable
   */
  rowClickable?: boolean

  /**
   * The default height for the table rows
   */
  rowHeight?: number

  /**
   * The default key for the table rows
   * @default 'id'
   */
  rowKey?: string

  /**
   * The actual data rows
   */
  rows?: any[]

  /**
   * The settings that are saveable whtin the table
   */
  nonSaveableSettings?: Array<'columns' | 'filters' | 'sorting'>

  /**
   * Whether the table rows should be selectable
   */
  selectable?: boolean

  /**
   * Defines visuals for the separators in the table
   */
  separator?: 'horizontal' | 'vertical' | 'cell'

  /**
   * When columns come from the metadata, this is the prefix used for the
   * `label` when creating the columns
   *
   * For example:
   *  `label: 'name'` will become `label: '<translationPrefix>.name'`
   */
  translationPrefix?: string

  /**
   * Whether the table should include archived rows
   * Note: Project specific
   */
  useIncludeDeleted?: boolean

  /**
   * Whether to use worker to handle intesive tasks
   * @default 'depends on amount of rows'
   */
  useWorker?: boolean

  /**
   * Method to get data for the table
   * `payloadKey` ~ key in the response that contains the data
   * `countKey` ~ key in the response that contains the total count of rows
   * `urlKey` ~ key in the response that contains the query params for the request
   * `hashKey` ~ key in the response that contains the hash key for the table
   * `createIdentifier` ~ function to create a unique identifier for each row when the `rowKey` is not unique
   * `errorHandler` ~ function to handle errors that come from fetching the table data
   */
  getData?: {
    fnc: (options: ITableDataFetchFncInput) => Promise<any> | any
    payloadKey?: string
    countKey?: string
    queryParamsKey?: string
    hashKey?: string
    createIdentifier?: (row: any, idx: number) => string | number
    errorHandler?: (error: any) => void
  }

  getTotalsData?: {
    fnc: (options: ITableQuery) => Promise<any> | any
    errorHandler?: (error: any) => void
  }

  getMetaData?: {
    /**
     * The function to get the metadata
     */
    fnc: () => any | Promise<any>

    /**
     * The key in the response that contains the columns
     * @default config.table.columnsKey
     */
    columnsKey?: string

    /**
     * The key in the response that contains the layouts
     * @default config.table.layoutsKey
     */
    layoutsKey?: string

    /**
     * The key in the response that contains the default layout
     * @default config.table.layoutKey
     */
    layoutKey?: string

    /**
     * When true, if metadata returns columns, they all will be used, no matter
     * if we defined just some of them explcitly in the `columns` prop
     */
    useAllColumns?: boolean

    /**
     * The function that handles the response in case of an error
     */
    errorHandler?: (error: any) => void
  }

  /**
   * Will split the table row into multiple columns
   * Usage: For mobile view
   * FIXME: Currently broken
   */
  splitRow?: number

  /**
   * Used in RecycleScroller
   */
  sizeField?: string

  /**
   * The selected rows, can be either:
   * * Array<string | number> ~ use for `rowKey` selection
   * * Record<itemKey, item> ~ use for `item` selection
   */
  selected?: ITableSelection

  /**
   * Selection key
   * The key to use for the selection
   */
  selectionKey?: string

  /**
   * Key for the local storage, if not provided, the key will be generated
   * based on the parent component of the table
   * use `null` to disable this functionality
   */
  storageKey?: string | null

  /**
   * Whether to use chip-like filters
   */
  useChips?: boolean // default ~ true

  /**
   * Whether to use server-side pagination, filtering and sorting
   */
  useServer?: boolean // default ~ true

  /**
   * Whether to use the url to store the table state
   */
  useUrl?: boolean
}
