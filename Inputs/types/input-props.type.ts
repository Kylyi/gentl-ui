// eslint-disable-next-line import/named
import { AnyMaskedOptions } from 'imask'
import { CSSProperties } from 'vue'

// TYPES
import type { IInputWrapperProps } from '~~/components/Inputs/types/input-wrapper-props.type'

export interface IInputProps extends IInputWrapperProps {
  autofocus?: boolean
  debounce?: number
  emitOnBlur?: boolean
  emptyValue?: any
  hint?: string
  inputClass?: ClassType
  inputStyle?: CSSProperties
  immediate?: boolean
  name?: string
  modelValue?: any

  // MASK
  mask?: AnyMaskedOptions
}
