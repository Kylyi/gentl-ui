// TYPES
import type { IItemProps } from '~/components/Item/types/item-props.type'
import type { ClassType } from '~/libs/App/types/class.type'

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
  /**
   * Whether the toggle allows string values for the check/uncheck values
   * So the string "true" would still be considered as a checked value.
   * @default true
   */
  allowString?: boolean

  /**
   * The value of the toggle when it's checked.
   * @default true
   */
  checkValue?: any

  /**
   * Visuals: Whether the toggle "bullet" is contained within the toggle.
   * @default true
   */
  contained?: boolean

  /**
   * The checkobx container class.
   */
  containerClass?: ClassType

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * Visuals: Whether the toggle is filled.
   */
  filled?: boolean

  /**
   * Whether to include the hover effect
   */
  hoverable?: boolean

  /**
   * The indeterminate value of the toggle.
   * @default null
   */
  indeterminateValue?: any

  /**
   * The toggle label
   */
  label?: string

  /**
   * The toggle label class.
   */
  labelClass?: ClassType

  /**
   * The actual value of the toggle.
   */
  modelValue?: any

  /**
   * Whether the toggle is readonly.
   */
  readonly?: boolean

  /**
   * The rounding of the toggle.
   */
  rounding?: 'full' | 'normal' | 'none'

  /**
   * The size of the toggle.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto'

  /**
   * The value of the toggle when it's unchecked.
   */
  uncheckValue?: any

  /**
   * Extra options for the visuals of the toggle.
   */
  visuals?: Partial<ToggleClass>
}
