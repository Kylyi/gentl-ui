export interface IPageDrawerProps {
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
   * The side on the page for the drawer
   */
  side?: 'left' | 'right'

  /**
   * The width of the drawer
   */
  width?: number
}
