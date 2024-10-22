// Types
import type { IListItem } from '~/components/List/types/list-item.type'
import type { IListDraggedItem } from '~/components/List/types/list-dragged-item.type'

export const listItemsKey: InjectionKey<Ref<Array<IGroupRow | IListItem>>>
  = Symbol('listItems')

export const listContainerKey: InjectionKey<Ref<HTMLElement | undefined>>
  = Symbol('listContainer')

export const listDraggedItemKey: InjectionKey<Ref<IListDraggedItem | undefined>>
  = Symbol('listDraggedItem')

export const listEmitDragEndEventKey: InjectionKey<(item: IListDraggedItem) => void> = Symbol('listEmitDragEndEvent')

export const listEmitDragStartEventKey: InjectionKey<(item: IListDraggedItem) => void> = Symbol('listEmitDragStartEvent')
