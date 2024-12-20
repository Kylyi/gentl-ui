// Types
import type { CrudAction } from '~/components/Crud/types/crud-action.type'

export type IMainBarProps = {
  actions?: Partial<Record<CrudAction, boolean>> | true
  loading?: boolean
  noBreadcrumbs?: boolean
  subtitle?: string
  title: string
  titleTruncate?: boolean
  headingClass?: ClassType
}
