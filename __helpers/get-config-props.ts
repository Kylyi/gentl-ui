import { config } from '~/components/config/components-config'

type ConfigWithPropsKeys<T> = {
  [K in keyof T]: T[K] extends { props: any } ? K : never
}[keyof T]

export function getComponentProps<T extends ConfigWithPropsKeys<typeof config>>(componentName: T) {
  return config[componentName]
}
