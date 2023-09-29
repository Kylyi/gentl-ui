import { FuseOptions } from '@vueuse/integrations/useFuse'
import { IItemToBeAdded } from '~/components/List/types/list-item-to-add.type'

// TYPES
import type { IListBaseProps } from '~/components/List/types/list-base-props.type'

// MODELS
import { SortItem } from '~/libs/App/data/models/sort-item.model'

export interface IListProps extends IListBaseProps {
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
  noAutofocus?: boolean
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
   * When using `multi` mode, whether to allow selecting all filtered options
   */
  allowSelectAllFiltered?: boolean

  /**
   * The extended search token for fuse.js library
   * https://www.fusejs.io/examples.html#extended-search
   */
  fuseExtendedSearchToken?: "'" | '=' | '!' | '^' | '!^' | '$' | '!$'

  /**
   * Can be either
   * Array<string | number | item>
   * Record<itemKey, boolean | item>
   * itemKey (~ only if not using `multi`)
   */
  selected?: any

  loadData?: {
    /**
     * The payload can actually be typed as follows:
     * payload: { search?: string }
     * But some queries dont have the search so to prevent TS from complaining, just use any
     */
    fnc: (payload: any) => Promise<any> | any
    mapKey?: string
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
  }

  /**
   * Allows on-the-fly adding of new items
   */
  allowAdd?: boolean

  /**
   * When `allowAdd` is used, we can also supply items that are about to be added
   * This is useful when using the `List` inside a `Menu`
   * -> When the `Menu` is closed, the `List` instance is destroyed and we lose the items
   * so we save it in the parent component
   */
  addedItems?: IItemToBeAdded[]

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
}
