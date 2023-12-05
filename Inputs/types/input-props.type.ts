import { type AnyMaskedOptions } from 'imask'
import { type CSSProperties } from 'vue'

// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export type IInputProps = IInputWrapperProps & {
  /**
   * Whether the input should be autofocused
   */
  autofocus?: boolean

  /**
   * The debounce time in ms
   */
  debounce?: number

  /**
   * Usually, we emit the value on `input` event
   * When this is true, we emit the value on `blur` event
   */
  emitOnBlur?: boolean

  /**
   * This is the value that gets emitted, when the input is empty
   * @default undefined
   */
  emptyValue?: any

  /**
   * The class of the input tag
   */
  inputClass?: ClassType

  /**
   * The style of the input tag
   */
  inputStyle?: CSSProperties

  /**
   * Whether to `touch` the input on mount
   */
  immediate?: boolean

  /**
   * The input name (for testing purposes)
   */
  name?: string

  // Mask (https://imask.js.org/guide.html)
  mask?: AnyMaskedOptions

  // Mask event handlers
  maskEventHandlers?: {
    onAccept?: (val: any) => void
    onCompleted?: (val: any) => void
  }

  /**
   * When set to true, blur state will not erase the value and will keep the last typed value with the mask
   */
  allowIncompleteMaskValue?: boolean
}
