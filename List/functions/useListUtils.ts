// Types
import { type IListProps } from '~/components/List/types/list-props.type'

export function useListUtils() {
  function getListProps(props: IListProps) {
    return reactivePick(props, [
      'allowAdd',
      'allowSelectAllFiltered',
      'basePadding',
      'clearable',
      'disabledFnc',
      'emitKey',
      'fuseExtendedSearchToken',
      'fuseOptions',
      'hasInfiniteScroll',
      'paddingByLevel',
      'groupBy',
      'inputProps',
      'multi',
      'noHover',
      'noSelect',
      'truncate',
      'rowClass',
      'loadData',
      'noFilter',
      'noHighlight',
      'noLocalAdd',
      'noSearch',
      'searchDebounce',
      'noSort',
      'search',
      'sortBy',
    ])
  }

  return {
    getListProps,
  }
}
