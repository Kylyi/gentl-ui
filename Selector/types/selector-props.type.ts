import { type CSSProperties } from 'vue'
import { type FuseOptions } from '@vueuse/integrations/useFuse'
import type { RouteLocationRaw } from '#vue-router'

// Types
import type { IInputProps } from '~/components/Inputs/types/input-props.type'
import type { IListProps } from '~/components/List/types/list-props.type'

// Models
import type { GroupItem } from '~/libs/Shared/models/group-item.model'
import type { SortItem } from '~/libs/Shared/models/sort-item.model'

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
   * The class applied to the `control` element
   */
  controlClass?: ClassType

  /**
   * Whether to hide clear buttons for selected items
   */
  noItemsClear?: boolean

  /**
   * When true, the menu will not be shown when the input is focused (via Tab for example),
   * needs to be actualyl clicked
   */
  noShowMenuOnFocus?: boolean

  /**
   * For cases when we want to warn user that he is about to clear the value
   * Usecase: when there is a dependent variable based on currently selected
   * option and by clearing the Selector, we need to also reset the dependent variable
   */
  clearConfirmation?: string

  disabledFnc?: (item: any) => boolean
  fuseOptions?: FuseOptions<any>
  groupBy?: GroupItem[]
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
  placeholderClass?: ClassType
  placeholderStyle?: CSSProperties

  /**
   * When selected, the item can have a link attached to it
   */
  optionTo?: (item: any) => RouteLocationRaw

  /**
   * When true (with combination of `alowAdd`), the component will not add the
   * new item locally, will only emit the option to the parent component.
   */
  noLocalAdd?: boolean
  sortBy?: SortItem[]

  // List
  emitKey?: boolean
  itemHeight?: number
  loadData?: IListProps['loadData']
  multi?: boolean
  maxChipsRows?: number
  noFilter?: boolean
  noHighlight?: boolean
  noSort?: boolean
  noSearch?: boolean
  searchDebounce?: number
  listClass?: ClassType
  search?: string
  hasInfiniteScroll?: IListProps['hasInfiniteScroll']

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

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: Record<string, any>

  /**
   * The function to use for transforming the added item
   */
  transformAddedItem?: (item: any) => any
}
