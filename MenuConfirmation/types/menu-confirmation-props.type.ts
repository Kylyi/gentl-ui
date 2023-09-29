import { IMenuProps } from '~/components/Menu/types/menu-props.type'

export interface IMenuConfirmationProps extends IMenuProps {
  hasConfirmation?: boolean
  confirmationText?: string
}
