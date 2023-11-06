// Types
import { type IInputProps } from '~/components/Inputs/types/input-props.type'

export interface ITextInputProps extends IInputProps {
  /**
   * If true, the input has its own enter key handler
   */
  customEnter?: boolean

  /**
   * The inputmode (native HTML attribute)
   */
  inputmode?: 'text' | 'decimal'

  /**
   * Whether the input is copyable
   */
  noCopy?: boolean

  /**
   * The type of the input (native HTML attribute)
   */
  type?: 'text' | 'password'

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: Record<string, any>
}
