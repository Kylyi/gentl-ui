// TYPES
import type { IListBaseProps } from '~/components/List/types/list-base-props.type'

export type IListRowProps = {
  item: any
  isDisabled?: boolean
  isSelected?: boolean
  isHovered?: boolean
  rowHeight?: number
  tag?: string
} & IListBaseProps
