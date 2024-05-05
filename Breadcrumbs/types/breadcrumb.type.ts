import { type IBtnProps } from '~/components/Button/types/btn-props.type'

export type IBreadcrumb = Omit<IBtnProps, 'label'> & {
  label?: string | (() => string)
}
