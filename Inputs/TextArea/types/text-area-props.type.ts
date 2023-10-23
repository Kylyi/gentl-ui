import { IInputProps } from '~/components/Inputs/types/input-props.type'

export interface ITextAreaInputProps extends IInputProps {
  /**
   * Whether the textarea should automatically grow
   */
  autogrow?: boolean

  /**
   * Determines if the resize handle is visible (and in which direction)
   */
  resize?: 'resize-none' | 'resize' | 'resize-x' | 'resize-y'

  /**
   * The number of rows to display
   *
   * NOTE - Does not work with `autogrow`
   */
  rows?: number

  /**
   * The props that should be passed to the input tag (<textarea>)
   */
  inputProps?: Record<string, any>
}
