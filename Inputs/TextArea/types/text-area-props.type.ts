import { IInputProps } from '~/components/Inputs/types/input-props.type'

export interface ITextAreaInputProps extends IInputProps {
  autogrow?: boolean
  resize?: 'resize-none' | 'resize' | 'resize-x' | 'resize-y'
  rows?: number
}
