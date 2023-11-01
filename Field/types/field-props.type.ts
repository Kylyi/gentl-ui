// Types
import { type IInputProps } from '~/components/Inputs/types/input-props.type'

// TODO: This is correct but breaks the props object...
// type IInputWrapperPropsWithouHasContent = Omit<IInputWrapperProps, 'hasContent'>

export interface IFieldProps extends IInputProps {
  controlClass?: ClassType
  modelValue?: any
  noContent?: boolean
}
