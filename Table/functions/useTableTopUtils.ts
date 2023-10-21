// Types
import { ITableProps } from '~/components/Table/types/table-props.type'

export function useTableTopUtils() {
  function getTableTopProps(props: ITableProps) {
    return reactivePick(props, [
      'tableTopFunctionality',
      'selectable',
      'nonSavableSettings',
      'minimumColumnWidth',
      'exportProps',
    ])
  }

  return { getTableTopProps }
}
