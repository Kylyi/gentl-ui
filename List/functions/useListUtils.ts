import { IListProps } from '~/components/List/types/list-props.type'

export function useListUtils() {
  function getListProps(props: IListProps) {
    return reactivePick(props, [
      'basePadding',
      'paddingByLevel',
      'groupBy',
      'itemKey',
      'itemLabel',
      'noHover',
      'noSelect',
      'truncate',
      'rowClass',
      'loadData',
      'noFilter',
    ])
  }

  return {
    getListProps,
  }
}
