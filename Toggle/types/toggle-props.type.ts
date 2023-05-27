// TYPES
import type { IItemProps } from '~~/components/Item/types/item-props.type'
import type { ClassType } from '~~/libs/App/types/class.type'

export type ToggleState = 'checked' | 'unchecked' | 'indeterminate'

export type ToggleClass = Record<
  ToggleState,
  {
    toggle?: ClassType
    bullet?: ClassType
    icon?: ClassType
  }
>

export interface IToggleProps extends IItemProps {
  checkValue?: any
  contained?: boolean
  containerClass?: ClassType
  disabled?: boolean
  filled?: boolean
  hoverable?: boolean
  indeterminateValue?: any
  label?: string
  modelValue?: any
  readonly?: boolean
  rounding?: 'full' | 'normal' | 'none'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
  uncheckValue?: any
  visuals?: Partial<ToggleClass>
}
