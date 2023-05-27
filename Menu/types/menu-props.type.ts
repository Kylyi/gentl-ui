import { Placement } from '@floating-ui/dom'

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
}
