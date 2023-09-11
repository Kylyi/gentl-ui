import { INavigation } from '~~/components/Button/types/btn-props.type'

export interface IChipProps extends INavigation {
  /**
   * Whether the chip has the CopyBtn
   */
  hasCopy?: boolean

  /**
   * Whether the chip has the button to remove it
   */
  hasRemove?: boolean

  /**
   * The chip's icon
   */
  icon?: string

  /**
   * The chip's label
   */
  label?: string | number

  /**
   * The chip's label class
   */
  labelClass?: ClassType

  /**
   * Whether the chip has the ripple effect
   */
  ripple?: boolean

  /**
   * Whether the chip centered
   */
  center?: boolean
}
