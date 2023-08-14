import { IQueryBuilderDraggedItem } from 'components/QueryBuilder/types/query-builder-dragged-item.type'
import { IQueryBuilderRow } from 'components/QueryBuilder/types/query-builder-row-props.type'
import { TableColumn } from 'components/Table/models/table-column.model'

// Abbreviation `qb` stands for `query builder`

export const qbColumnsKey: InjectionKey<MaybeRefOrGetter<TableColumn<any>[]>> =
  Symbol('qbColumns')

export const qbItemsKey: InjectionKey<MaybeRefOrGetter<IQueryBuilderRow[]>> =
  Symbol('qbItems')

export const qbHoveredItemKey: InjectionKey<Ref<IQueryBuilderRow | undefined>> =
  Symbol('qbHoveredItem')

export const qbContainerKey: InjectionKey<Ref<HTMLElement | undefined>> =
  Symbol('qbContainer')

export const qbDraggedItemKey: InjectionKey<
  Ref<IQueryBuilderDraggedItem | undefined>
> = Symbol('qbDraggedItem')

export const qbCollapsedKey: InjectionKey<Ref<Record<string, boolean>>> =
  Symbol('qbCollapsed')

export const qbIsSmallerScreenKey: InjectionKey<Ref<boolean>> =
  Symbol('qbIsSmallerScreen')
