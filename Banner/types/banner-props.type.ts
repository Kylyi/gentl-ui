export type IBannerProps = {
  /**
   * The number in top right corner on the `Banner`
   */
  counter?: number
  dismissable?: boolean
  iconCenter?: boolean
  iconClass?: ClassType
  label?: string
  modelValue?: boolean
  noTransition?: boolean
  outlined?: boolean
  type?: 'error' | 'info' | 'success' | 'warning'
}
