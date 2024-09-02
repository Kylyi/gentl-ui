// Types
import type { IInputProps } from '~/components/Inputs/types/input-props.type'
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'

export type ITextInputProps = IInputProps & {
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
  type?: 'text' | 'password' | 'email'

  /**
   * The props that should be passed to the tooltip
   */
  tooltipProps?: IMenuProps
}
