import type { CSSProperties } from 'vue'

export interface ICollapseProps {
  /**
   * When true, the collapse content will be positioned absolutely
   */
  floating?: boolean

  /**
   * The class to be applied to the content
   */
  contentClass?: ClassType

  /**
   * The class to be applied to the header
   */
  headerClass?: ClassType

  /**
   * The CSS style for the header
   */
  headerStyle?: CSSProperties

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
   * When true, the collapse will not have the separator line when open
   */
  noSeparator?: boolean

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

  /**
   * The class to be applied to the content when transitioning
   */
  transitionClass?: ClassType
}
