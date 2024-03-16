// Types
import { type ITableProps } from '~/components/Table/types/table-props.type'

export function useTableTopUtils() {
  function getTableTopProps(props: ITableProps) {
    return reactivePick(props, [
      'tableTopFunctionality',
      'selectionOptions',
      'nonSavableSettings',
      'minimumColumnWidth',
      'exportProps',
      'noSearch',
    ])
  }

  return { getTableTopProps }
}
