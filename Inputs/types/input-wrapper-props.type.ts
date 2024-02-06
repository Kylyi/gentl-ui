import { type CSSProperties } from 'vue'

// Types
import type { InputLabelProps } from '~/components/Inputs/types/input-label-props.type'

export type IInputWrapperProps = InputLabelProps & {
  /**
   * The class of the input wrapper (including label,...)
   */
  contentClass?: ClassType

  /**
   * The style of the input container
   */
  contentStyle?: CSSProperties

  /**
   * The cursor that will be shown when hovering over the input
   */
  cursor?: 'cursor-text' | 'cursor-pointer' | 'cursor-default'

  /**
   * Whether the input is disabled
   */
  disabled?: boolean

  /**
   * When true, the error container takes space (~ is relative positioned)
   * WHen false, the error container is absolute positioned
   */
  errorTakesSpace?: boolean

  /**
   * Whether the error is visible
   */
  errorVisible?: boolean

  /**
   * The hint that will be shown below the input
   */
  hint?: string

  /**
   * Class of the input container
   */
  inputContainerClass?: ClassType

  /**
   * Style of the input container
   */
  inputContainerStyle?: CSSProperties

  /**
   * Whether the input is loading
   */
  loading?: boolean

  /**
   * The input value
   */
  modelValue?: any

  /**
   * Whether the input has no border
   * FIXME: Currently broken
   */
  noBorder?: boolean

  /**
   * The original value of the input
   * Is used to compare the current value with the original value
   */
  previousValue?: any

  /**
   * Whether the input is readonly
   */
  readonly?: boolean

  /**
   * When clicking into the input, the tooltip will be shown
   * Note: Currently works only for TextInput
   */
  tooltip?: string

  ui?: {
    /**
     * The border color of the input
     */
    borderColor?: string
  }
}
