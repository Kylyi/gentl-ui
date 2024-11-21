export type IWysiwygSinkProps = {
  enabled?: boolean

  /**
   * When true, the sink will always be visible
   */
  alwaysVisible?: boolean

  /**
   * When true, the sink will float on top of the input (absolute positioned)
   */
  floating?: boolean

  /**
   * When using `floating`, this prop will determine the placement of the sink
   */
  floatingPlacement?: 'top' | 'bottom'
}