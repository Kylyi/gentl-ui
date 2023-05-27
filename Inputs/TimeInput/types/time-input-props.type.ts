import { IInputProps } from '~~/components/Inputs/types/input-props.type'

export type ITimeInputShortcut = {
  label: string
  value: string
}

export interface ITimeInputProps extends IInputProps {
  shortcuts?: ITimeInputShortcut[]
}
