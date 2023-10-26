import { IMenuProps } from '~/components/Menu/types/menu-props.type'

export interface IMenuConfirmationProps extends IMenuProps {
  /**
   * Whether the confirmation has visual confirmation (the big checkmark)
   */
  hasConfirmation?: boolean

  /**
   * The text to display in the confirmation menu
   */
  confirmationText?: string

  /**
   * Whether to show the confirmation button
   * Use case: when we provide own slot with `Form` for example
   */
  noConfirmBtn?: boolean
}
