import { config } from '~/components/config/components-config'

export function getConfigProps(componentName: keyof typeof config) {
  const component = config[componentName]

  if (typeof component === 'object' && 'props' in component) {
    return component.props
  }
}
