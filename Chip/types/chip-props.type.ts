import { INavigation } from '~~/components/Button/types/btn-props.type'

export interface IChipProps extends INavigation {
  hasRemove?: boolean
  icon?: string
  label?: string | number
  ripple?: boolean
  center?: boolean
}
