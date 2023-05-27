import { IInputWrapperProps } from '~~/components/Inputs/types/input-wrapper-props.type'

export interface IWysiwygProps extends IInputWrapperProps {
  debounce?: number
  emptyValue?: any
  hint?: string
  name?: string
  noSink?: boolean
  modelValue?: any
  sinkAlwaysVisible?: boolean
}
