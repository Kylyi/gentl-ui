import { FuseOptions } from '@vueuse/integrations/useFuse'

// TYPES
import type { IListBaseProps } from '~~/components/List/types/list-base-props.type'

// MODELS
import { SortItem } from '~~/libs/App/data/models/sort-item.model'

export interface IListProps extends IListBaseProps {
  bordered?: boolean
  clearable?: boolean
  contentClass?: ClassType
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
   * Can be either
   * Array<string | number | item>
   * Record<itemKey, boolean | item>
   * itemKey (~ only if not using `multi`)
   */
  selected?: any
}
