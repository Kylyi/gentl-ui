import { type IInputProps } from '~/components/Inputs/types/input-props.type'

export type ITimeInputShortcut = {
  label: string
  value: string
}

export type ITimeInputProps = IInputProps & {
  /**
   * The shortcuts
   */
  shortcuts?: ITimeInputShortcut[]
}
