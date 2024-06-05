// Types
import type { IListItem } from '~/components/List/types/list-item.type'
import type { IListProps } from '~/components/List/types/list-props.type'

export function useListUtils() {
  function getListProps(props: IListProps) {
    return reactivePick(props, [
      'allowAdd',
      'allowSelectAllFiltered',
      'basePadding',
      'clearable',
      'disabledFnc',
      'emitKey',
      'fuseExtendedSearchToken',
      'fuseOptions',
      'hasInfiniteScroll',
      'paddingByLevel',
      'groupBy',
      'inputProps',
      'multi',
      'noHover',
      'noSelect',
      'truncate',
      'rowClass',
      'loadData',
      'noFilter',
      'noHighlight',
      'noLocalAdd',
      'noSearch',
      'reorderable',
      'searchDebounce',
      'noSort',
      'search',
      'sortBy',
      'transformAddedItem',
    ])
  }

  // TODO: Refactor this (needs to support groups)
  function handleMoveItem(payload: {
    itemsRef: Ref<Array<IGroupRow | IListItem>>
    id: number | string
    targetId: number | string
    direction?: 'above' | 'below'
  }) {
    const { id, targetId, direction, itemsRef } = payload

    let items = toValue(itemsRef)
    const currentIdx = items.findIndex(item => item.id === id)
    const targetIdx = items.findIndex(item => item.id === targetId)

    const splicedItem = items[currentIdx]
    items = items.toSpliced(currentIdx, 1, { _moved: true } as any)

    items = items.toSpliced(
      direction === 'below' ? targetIdx + 1 : targetIdx,
      0,
      splicedItem,
    )

    // @ts-expect-error Moved item
    itemsRef.value = items.filter(item => !item._moved)
    updatePaths(itemsRef)
  }

  function handleMoveItems(payload: {
    itemsRef: Ref<Array<IGroupRow | IListItem>>
    ids: Array<number | string>
    targetId: number | string
    direction?: 'above' | 'below'
  }) {
    const { ids, targetId, direction, itemsRef } = payload

    let items = toValue(itemsRef)

    const splicedItems: any[] = []
    ids.forEach(id => {
      const currentIndex = items.findIndex(item => item.id === id)

      const splicedItem = items[currentIndex]
      items = items.toSpliced(currentIndex, 1, { _moved: true } as any)
      splicedItems.push(splicedItem)
    })

    const targetIdx = items.findIndex(item => item.id === targetId)
    items = items.toSpliced(
      direction === 'below' ? targetIdx + 1 : targetIdx,
      0,
      ...splicedItems,
    )

    // @ts-expect-error Moved items
    itemsRef.value = items.filter(item => !item._moved)
    updatePaths(itemsRef)
  }

  /**
   * Update paths of the items structure
   */
  function updatePaths(itemsRef: Ref<Array<IGroupRow | IListItem>>) {
    toValue(itemsRef).forEach((item, idx) => {
      // @ts-expect-error Groups
      item.path = `${idx}`
    })
  }

  return {
    getListProps,
    handleMoveItem,
    handleMoveItems,
    updatePaths,
  }
}
