export interface IFormProps {
  bordered?: boolean
  contentClass?: ClassType
  controlsClass?: ClassType
  dense?: boolean
  errors?: string[]
  label?: string
  icon?: string
  loading?: boolean

  /**
   * By default, the form will display the controls on the bottom of the form. (Submit button, etc.)
   * If this is true, the controls will be displayed on the top of the form.
   */
  controlsOnTop?: boolean

  /**
   * By default, the form will display the errors on the bottom of the form.
   * If this is true, the errors will be displayed on the top of the form.
   */
  errorsOnTop?: boolean

  /**
   * By default, on smaller screens, the buttons in the form will use their icons
   * to save the screen space. If this is true, the buttons will always display
   * the labels as well.
   */
  labelForcedVisibility?: boolean

  /**
   * Whether the form should include the bottom controls
   */
  noControls?: boolean

  /**
   * By default, the form uses `flex-grow` to fill the available space.
   * If this is true, the form will not use the `flex-grow`.
   */
  noGrow?: boolean

  /**
   * If true, the form will include the submit button.
   */
  noSubmit?: boolean

  /**
   * Class for the submit button.
   */
  submitClass?: ClassType

  /**
   * If true, the form submit will beed to be confirmed in a confirmation menu.
   */
  submitConfirmation?: boolean

  /**
   * The text to display in the submit confirmation menu.
   */
  submitConfirmationText?: string

  /**
   * If true, the submit button will be disabled.
   */
  submitDisabled?: boolean
}
