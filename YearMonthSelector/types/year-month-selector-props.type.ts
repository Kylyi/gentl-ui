// TYPES
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export interface IYearMonthSelectorProps extends IInputWrapperProps {
  clearable?: boolean
  emptyValue?: any
  modelValue?: Datetime
}
