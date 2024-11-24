import { config } from '~/components/config/components-config'

type ConfigWithPropsKeys<T> = {
  [K in keyof T]: T[K] extends { props: any } ? K : never
}[keyof T]

type ResolvedConfig<T> = {
  [K in keyof T]: T[K] extends object | any[]
    ? () => T[K]
    : T[K]
}

export function getComponentConfig<T extends ConfigWithPropsKeys<typeof config>>(componentName: T) {
  return config[componentName]
}

function prepareComponentProps<T extends IItem>(props: T): ResolvedConfig<T> {
  return Object.entries(props).reduce((agg, [key, value]) => {
    if (typeof value === 'object' || Array.isArray(value)) {
      (agg as any)[key] = () => value // Explicitly cast for safety
    } else {
      (agg as any)[key] = value
    }

    return agg
  }, {} as ResolvedConfig<T>)
}

export function getComponentProps<T extends ConfigWithPropsKeys<typeof config>>(componentName: T) {
  const component = config[componentName]

  if (!component) {
    return
  }

  return prepareComponentProps(component.props)
}
