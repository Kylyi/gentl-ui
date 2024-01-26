// TYPES
import type { GroupItem } from '~/libs/App/data/models/group-item.model'

export interface IListBaseProps {
  basePadding?: number
  paddingByLevel?: number
  groupBy?: GroupItem[]
  itemKey?: string
  itemLabel?: ((opt: any) => string) | string
  noHover?: boolean
  noSelect?: boolean
  rowClass?: ClassType
  truncate?: boolean
}
