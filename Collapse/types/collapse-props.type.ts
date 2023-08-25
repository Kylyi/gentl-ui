export interface ICollapseProps {
  /**
   * When true, the collapse content will be positioned absolutely
   */
  floating?: boolean

  /**
   * The class to be applied to the header
   */
  headerClass?: ClassType

  /**
   * The initial state of the collapse
   */
  initialValue?: boolean

  /**
   * When true, the collapse will be disabled
   */
  loading?: boolean

  /**
   * The state of the collapse
   */
  modelValue?: boolean

  /**
   * When true, the collapse header will not be shown
   */
  noHeader?: boolean

  /**
   * The collapse subtitle
   */
  subtitle?: string

  /**
   * The collapse title
   */
  title?: string

  /**
   * Visually pad the content of the collapse if set to true
   */
  padded?: boolean
}
