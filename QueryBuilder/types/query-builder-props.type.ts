// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

export type IQueryBuilderProps = {
  editable?: boolean
  columns: TableColumn<any>[]
  items: IQueryBuilderRow[]
}
