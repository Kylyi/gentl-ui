import { IInputProps } from '~/components/Inputs/types/input-props.type'

export interface ITextInputProps extends IInputProps {
  inputmode?: 'text' | 'decimal'
  noCopy?: boolean
  type?: 'text' | 'password'
}
