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

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: Record<string, any>
}
