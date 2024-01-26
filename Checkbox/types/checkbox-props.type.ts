// Types
import type { ToggleState } from '~/components/Toggle/types/toggle-props.type'

export type CheckboxClass = Record<
  ToggleState,
  {
    checkbox?: ClassType
    label?: ClassType
  }
>
export interface ICheckboxProps {
  checkValue?: any
  color?:
    | 'primary'
    | 'secondary'
    | 'positive'
    | 'warning'
    | 'negative'
    | 'info'
    | 'light'
    | 'dark'
    | 'darker'
  comparatorFn?: (model: any, val: any) => boolean
  editable?: boolean
  indeterminate?: boolean
  indeterminateValue?: any
  label?: string
  labelClass?: ClassType
  modelValue?: any
  noHoverEffect?: boolean
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  uncheckValue?: any
  visuals?: Partial<CheckboxClass>

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: Record<string, any>
}
