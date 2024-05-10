import { type FuseOptions } from '@vueuse/integrations/useFuse'

// Types
import type { IListBaseProps } from '~/components/List/types/list-base-props.type'
import type { IListFetchFnc } from '~/components/List/types/list-fetch.type'
import type { IItemToBeAdded } from '~/components/List/types/list-item-to-add.type'

// Models
import { SortItem } from '~/libs/Shared/models/sort-item.model'

export type IListProps = IListBaseProps & {
  bordered?: boolean
  clearable?: boolean
  contentClass?: ClassType
  dense?: boolean
  disabledFnc?: (item: any) => boolean
  emitKey?: boolean
  emptyValue?: any
  groupsSelectable?: boolean
  loading?: boolean
  items?: any[]
  rowHeight?: number
  rowGroupHeight?: number
  fuseOptions?: FuseOptions<any>
  multi?: boolean
  noFilter?: boolean
  noHighlight?: boolean
  noSearch?: boolean
  noSort?: boolean
  search?: string
  sortBy?: SortItem[]
  truncate?: boolean
  useWorker?: boolean
  virtual?: boolean

  /**
   * When `allowAdd` is used, we can also supply items that are about to be added
   * This is useful when using the `List` inside a `Menu`
   * -> When the `Menu` is closed, the `List` instance is destroyed and we lose the items
   * so we save it in the parent component
   */
  addedItems?: IItemToBeAdded[]

  /**
   * Allows on-the-fly adding of new items
   */
  allowAdd?: boolean

  /**
   * When using `multi` mode, whether to allow selecting all filtered options
   */
  allowSelectAllFiltered?: boolean

  /**
   * The extended search token for fuse.js library
   * https://www.fusejs.io/examples.html#extended-search
   */
  fuseExtendedSearchToken?: "'" | '=' | '!' | '^' | '!^' | '$' | '!$'

  /**
   * When true, when scrolling to the bottom of the list, the `loadData` fnc will be called
   * and the list will be extended with the new data
   */
  hasInfiniteScroll?: boolean

  /**
   * The props that should be passed to the search input tag (<input>)
   */
  inputProps?: Record<string, any>

  /**
   * When true, the `addedItems` will not be removed on unselect
   */
  keepAddedItems?: boolean

  loadData?: {
    /**
     * The function to use for fetching the data
     */
    fnc: IListFetchFnc

    /**
     * The key to use for the items from the server response
     */
    mapKey?: string

    /**
     * The key to use for the total count of items from the server response
     */
    countKey?: string

    /**
     * When true, the `loadData` fnc will be called on mount
     */
    immediate?: boolean

    /**
     * Use when the data is already loaded and we want to use it
     * When this is used, the `mapKey` is ignored and array of objects should be provided
     */
    local?: boolean

    /**
     * When true, the `loadData` fnc will be called on every search
     */
    onSearch?: boolean

    /**
     * The fields to select from the query
     *
     * TODO - Not implemeneted
     */
    select?: string[]
  }

  /**
   * When true, the search/container will not be focused on mount
   */
  noAutofocus?: boolean

  /**
   * When true (with combination of `alowAdd`), the component will not add the
   * new item locally, will only emit the option to the parent component.
   */
  noLocalAdd?: boolean

  /**
   * The tag to use for the row
   */
  rowTag?: string

  /**
   * Debounce of the search in ms
   */
  searchDebounce?: number

  /**
   * Can be either
   * Array<string | number | item>
   * Record<itemKey, boolean | item>
   * itemKey (~ only if not using `multi`)
   */
  selected?: any

  /**
   * When true, when searching locally, the search string will first
   * be transformed via the `toBoldLatin` fnc
   */
  useToBoldLatin?: boolean
}
