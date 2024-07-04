// Models
import type { GroupItem } from '~/libs/Shared/models/group-item.model'

export type IListBaseProps = {
  basePadding?: number
  paddingByLevel?: number
  groupBy?: GroupItem[]
  itemKey?: string
  itemLabel?: ((opt: any) => string) | string
  noHover?: boolean
  noSelect?: boolean
  rowClass?: ClassType
  truncate?: boolean
  reorderable?: boolean | ((item: any) => boolean)
}
