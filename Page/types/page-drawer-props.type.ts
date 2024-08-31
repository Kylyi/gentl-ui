// Types
import type { BREAKPOINTS } from '~/libs/App/constants/breakpoints.constant'

export type IPageDrawerProps = {
  /**
   * At which breakpoint the drawer becomes absolutely positioned
   * Note: Use `xs` to never go into absolute mode
   */
  absoluteBreakpoint?: keyof typeof BREAKPOINTS

  /**
   * At which breakpoint the drawer becomes absolutely positioned and full width
   * Note: Use `xs` to never get into the absolute full width mode
   */
  absoluteFullWidthBreakpoint?: keyof typeof BREAKPOINTS

  /**
   * The class to apply to the bottom part of the drawer
   */
  bottomClass?: ClassType

  /**
   * The class to apply to the drawer content
   */
  contentClass?: ClassType

  /**
   * When true, the drawer will take up the full height of the page, including
   * the navigation bar
   */
  fullHeight?: boolean

  /**
   * Whether the is currently in the `mini` mode
   */
  mini?: boolean

  /**
   * The width of the drawer in `mini` mode
   */
  miniWidth?: number

  /**
   * Whether the drawer is currently open
   */
  modelValue?: boolean

  /**
   * Whether to show the bottom part of the drawer
   */
  noBottom?: boolean

  /**
   * The side on the page for the drawer
   */
  side?: 'left' | 'right'

  /**
   * The width of the drawer
   */
  width?: number
}
