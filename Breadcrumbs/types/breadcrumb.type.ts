import { NuxtLink } from '#components'

export type IBreadcrumb = {
  icon?: string
  label?: string
  to: InstanceType<typeof NuxtLink>['to']
}
