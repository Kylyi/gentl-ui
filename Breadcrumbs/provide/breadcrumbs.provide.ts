// Types
import type { IBreadcrumb } from '~/components/Breadcrumbs/types/breadcrumb.type'

export const breadcrumbsKey: InjectionKey<Ref<IBreadcrumb[]>> = Symbol('breadcrumbs')
export const breadcrumbsHomePathKey: InjectionKey<Ref<string>> = Symbol('breadcrumbsHomePath')
