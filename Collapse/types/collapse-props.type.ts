export interface ICollapseProps {
  floating?: boolean
  headerClass?: ClassType
  initialValue?: boolean
  loading?: boolean
  modelValue?: boolean
  noHeader?: boolean
  subtitle?: string
  title?: string

  /**
   * Visually pad the content of the collapse if set to true
   */
  padded?: boolean
}
