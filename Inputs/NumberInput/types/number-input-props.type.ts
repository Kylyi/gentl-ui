// Types
import { type IInputProps } from '~/components/Inputs/types/input-props.type'

export type INumberInputProps = IInputProps & {
  /**
   * The number of decimal places to display
   */
  fractionDigits?: number

  /**
   * The minimum value
   */
  min?: number

  /**
   * The maximum value
   */
  max?: number

  /**
   * Whether the number should use grouping separators
   */
  noGrouping?: boolean

  /**
   * The step to increment/decrement the value by
   *
   * NOTE - use `null` to remove the step
   */
  step?: number | 'auto' | null

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: Record<string, any>
}
