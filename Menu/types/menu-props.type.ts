import { type Placement } from '@floating-ui/dom'

// TYPES
import type { FloatingUIBaseProps } from '~/components/Dialog/types/dialog-props.type'

export interface IMenuProps extends FloatingUIBaseProps {
  cover?: boolean
  fallbackPlacements?: Placement[]
  fit?: boolean
  matchWidth?: boolean
  noArrow?: boolean
  noOverlay?: boolean
  offset?: number
  placement?: Placement
  virtual?: boolean

  /**
   * Delay in milliseconds before the menu is [shown, hidden]
   */
  delay?: [number, number]

  /**
   * Function we can inject before the hide event
   * Should return whether the hide event should go through or not (Boolean)
   */
  beforeHideFnc?: () => boolean | Promise<boolean>
}
