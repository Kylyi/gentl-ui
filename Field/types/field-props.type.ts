// TYPES
import type { IInputWrapperProps } from '~~/components/Inputs/types/input-wrapper-props.type'

// TODO: This is correct but breaks the props object...
// type IInputWrapperPropsWithouHasContent = Omit<IInputWrapperProps, 'hasContent'>

export interface IFieldProps extends IInputWrapperProps {
  noContent?: boolean
}
