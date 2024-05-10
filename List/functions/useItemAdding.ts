// Types
import { type IItemToBeAdded } from '~/components/List/types/list-item-to-add.type'
import { type IListProps } from '~/components/List/types/list-props.type'

export function useItemAdding(
  props: Pick<
    IListProps,
    'allowAdd' | 'itemKey' | 'itemLabel' | 'addedItems' | 'multi'
  >
) {
  const preAddedItem = ref<IItemToBeAdded>()
  const addedItems = props.addedItems
  ? useVModel(props, 'addedItems') as Ref<IItemToBeAdded[]>
  : ref<IItemToBeAdded[]>([])

  function handleSearch(payload: { search: string; hasExactMatch: boolean }) {
    const { search, hasExactMatch } = payload

    if (props.allowAdd) {
      // Already adding an item ~ sync label with search value
      if (search && !hasExactMatch && preAddedItem.value) {
        set(preAddedItem.value, props.itemLabel as string, search)
      }

      // New item to be added
      else if (search && !hasExactMatch) {
        const labelKey =
          typeof props.itemLabel === 'function'
            ? 'label'
            : props.itemLabel || 'label'

        preAddedItem.value = {
          [props.itemKey as string]: String(new Date().getTime()),
          [labelKey]: search,
          _isNew: true,
          _isCreate: false,
        }
      }

      // Item with exact match found or no `search` value
      else {
        preAddedItem.value = undefined
      }
    }

    return preAddedItem.value
  }

  function addItem(item: IItemToBeAdded) {
    addedItems.value = [
      ...addedItems.value,
      { ...item, _isNew: false, _isCreate: true },
    ]
  }

  return {
    addedItems,
    preAddedItem,
    addItem,
    handleSearch,
  }
}
