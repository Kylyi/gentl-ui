export interface IDrawerProps {
  /**
   * Whether the drawer should be absolute positioned
   *
   * @default false => the position is fixed
   */
  absolute?: boolean

  /**
   * The breakpoint at which the drawer will be full screen
   */
  breakpoint?: keyof typeof BREAKPOINTS

  /**
   * Whether the drawer should be full height (over the navigation bar)
   */
  fullHeight?: boolean

  /**
   * Whether the drawer is open
   */
  modelValue: boolean

  /**
   * When true, title will be hidden
   */
  noTitle?: boolean

  /**
   * On which side the drawer should be
   */
  side?: 'left' | 'right'

  /**
   * The title of the drawer
   */
  title?: string

  /**
   * The class for the title container
   */
  titleClass?: ClassType

  /**
   * The width of the drawer
   */
  width?: number
}
