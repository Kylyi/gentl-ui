import { Boundary } from '@floating-ui/dom'

export type DialogPosition = 'top' | 'bottom' | 'left' | 'right'

export interface FloatingUIBaseProps {
  boundary?: Boundary
  contentClass?: string
  dense?: boolean
  headerClass?: ClassType
  hideHeader?: boolean
  manual?: boolean
  maxHeight?: number | string
  modelValue?: boolean
  noTransition?: boolean
  persistent?: boolean
  title?: string
  transitionDuration?: number
  trigger?: 'click' | 'contextmenu'

  /**
   * Element that triggers the Floating UI
   */
  target?: any

  /**
   * This prop is not used in <Dialog /> but it needs to be here because <Menu /> uses it
   * therefore <MenuProxy /> uses it. If it wasn't here, the HTML would try
   * to stringify it and throw an error.
   */
  referenceTarget?: any

  /**
   * Used only in <Menu /> to prevent the menu to automatically `uplift` (~ high zIndex)
   * the `referenceTarget`
   * CANNOT BE USED WITH OVERLAY!
   */
  noUplift?: boolean
}

export interface IDialogProps extends FloatingUIBaseProps {
  position?: DialogPosition
  seamless?: boolean

  /**
   * This prop is not used but it needs to be here because <Menu /> uses it
   * therefore <MenuProxy /> uses it. If it wasn't here, the HTML would try
   * to stringify it and throw an error.
   */
  referenceTarget?: any
}
