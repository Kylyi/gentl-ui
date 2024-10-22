// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export type IYearMonthSelectorProps = IInputWrapperProps & {
  clearable?: boolean
  emptyValue?: any
  modelValue?: Datetime
}
