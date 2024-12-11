// Types
import type { INavigation } from '~/components/Button/types/btn-props.type'

export type IChipProps = {
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
  icon?: ClassType

  /**
   * The chip's label
   */
  label?: string | number | (() => string | number)

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
} & INavigation
