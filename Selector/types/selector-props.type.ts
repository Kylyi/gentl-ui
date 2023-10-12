import { FuseOptions } from '@vueuse/integrations/useFuse'
import { FloatingUIBaseProps } from '~/components/Dialog/types/dialog-props.type'

// TYPES
import type { IInputProps } from '~/components/Inputs/types/input-props.type'

// MODELS
import { GroupItem } from '~/libs/App/data/models/group-item.model'
import { SortItem } from '~/libs/App/data/models/sort-item.model'

export type ISelectorProps = IInputProps & {
  /**
   * Class applied to the `append` slot
   */
  appendClass?: ClassType

  /**
   * Allows on-the-fly adding of new options
   */
  allowAdd?: boolean

  /**
   * Whether the Selector can be cleared -> will emit `emptyValue`
   */
  clearable?: boolean

  /**
   * Whether to hide clear buttons for selected items
   */
  noItemsClear?: boolean

  /**
   * For cases when we want to warn user that he is about to clear the value
   * Usecase: when there is a dependent variable based on currently selected
   * option and by clearing the Selector, we need to also reset the dependent variable
   */
  clearConfirmation?: string

  disabledFnc?: (item: any) => boolean
  fuseOptions?: FuseOptions<any>
  groupBy?: GroupItem[]
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
  noDropdownIcon?: boolean
  noTruncate?: boolean
  preselectFirst?: boolean
  initialMap?: Record<string, any> | null

  /**
   * Usage: Let's say we already selected some of the options in different
   * selectors and we don't want to let user select it again
   * @example { [OPTION_KEY: string]: boolean } -> { 'id123': true }
   */
  hiddenOptions?: Record<string, boolean>

  /**
   * Whether the list should also show currently selected value, works
   * with `hiddenOptions` prop
   */
  hideSelf?: boolean
  optionKey?: string
  optionLabel?: ((opt: any) => string) | string
  options?: any[]
  scroller?: boolean
  innerClass?: ClassType

  /**
   * When true (with combination of `alowAdd`), the component will not add the
   * new item locally, will only emit the option to the parent component.
   */
  noLocalAdd?: boolean
  sortBy?: SortItem[]

  // LIST
  emitKey?: boolean
  itemHeight?: number
  multi?: boolean
  maxChipsRows?: number
  noFilter?: boolean
  noHighlight?: boolean
  noSort?: boolean
  noSearch?: boolean
  searchDebounce?: number
  listClass?: ClassType

  /**
   * The extended search token for fuse.js library
   * https://www.fusejs.io/examples.html#extended-search
   */
  fuseExtendedSearchToken?: "'" | '=' | '!' | '^' | '!^' | '$' | '!$'

  /**
   * When using `multi` mode, whether to allow selecting all filtered options
   */
  allowSelectAllFiltered?: boolean

  // MENU
  /**
   * When true, the menu will NOT match the width of the selector
   * Use case:
   *   - when the selector has options with long text and icons and we only want
   *     to show the icon when the options is chosen -> the Selector component
   *     can be very small (to show the icon) but the menu still should be wide
   *     enough to show the whole text
   */
  noMenuMatchWidth?: boolean
} & Pick<FloatingUIBaseProps, 'expectedHeight'>
