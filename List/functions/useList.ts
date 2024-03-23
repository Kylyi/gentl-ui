import { type UseFuseOptions, useFuse } from '@vueuse/integrations/useFuse'
import { klona } from 'klona'
import { type Required } from 'utility-types'
import { type MaybeElementRef } from '@vueuse/core'
import { config } from '~/components/config/components-config'

// Types
import type { IListProps } from '~/components/List/types/list-props.type'
import type { IListFetchOptions } from '~/components/List/types/list-fetch.type'
import {
  type IGroupRow,
  useGrouping,
} from '~/libs/App/data/functions/useGrouping'

// Models
import { GroupItem } from '~/libs/App/data/models/group-item.model'
import { SortItem } from '~/libs/App/data/models/sort-item.model'

// Functions
import { highlight } from '~/components/List/functions/highlightText'
import { useSorting } from '~/libs/App/data/functions/useSorting'
import { useListUtils } from '~/components/List/functions/useListUtils'
import { useItemAdding } from '~/components/List/functions/useItemAdding'

// Components
import ListVirtualContainer from '~/components/List/ListVirtualContainer.vue'
import SearchInput from '~/components/Inputs/SearchInput.vue'
import { useListKeyboardNavigation } from '~/components/List/functions/useListKeyboardNavigation'

type IItem = {
  ref: any
  id: string
  _highlighted?: string
}

type IListPropsWithDefaults = Required<
  IListProps,
  'groupBy' | 'itemKey' | 'itemLabel'
>

export function useList(
  items: Ref<any[]>,
  props: IListPropsWithDefaults,
  listContainerRef: MaybeElementRef<
    InstanceType<typeof ListVirtualContainer> | undefined
  >
) {
  const self = getCurrentInstance()!
  const isInitialized = ref(false)

  // Utils
  const { abortController, handleRequest } = useRequest()
  const { normalizeText } = useText()
  const { sortData } = useSorting()
  const { groupData } = useGrouping()
  const { getListProps } = useListUtils()
  const {
    handleSearch: handleAddOnSearch,
    addedItems,
    preAddedItem,
    addItem,
  } = useItemAdding(props)

  const { getKey, getLabel, getOption, getEmitValue } = {
    getKey: (option: any) =>
      typeof option === 'object' ? get(option, props.itemKey) : option,
    getOption: (option: any) =>
      typeof option === 'object' ? option : itemsByKey.value[option],
    getEmitValue: (option: any) =>
      props.emitKey ? getKey(option) : getOption(option),
    getLabel: (option: any) => {
      if (typeof props.itemLabel === 'function') {
        return props.itemLabel(option)
      }

      return typeof option === 'object' ? get(option, props.itemLabel) : option
    },
  }

  const fuseOptions: UseFuseOptions<any> = {
    matchAllWhenSearchEmpty: true,
    fuseOptions: {
      minMatchCharLength: 1,
      threshold: 0.4,
      isCaseSensitive: false,
      includeMatches: true,
      includeScore: true,
      keys: [props.itemLabel],
      findAllMatches: true,
      useExtendedSearch: true,

      ...props.fuseOptions,
    },
  }

  const useToBoldLatin =
    props.useToBoldLatin ?? config.list.props.useToBoldLatin

  // List
  const isLoading = ref(false)
  const listRowProps = computed(() => getListProps(props))

  const itemsExtended = computed(() => {
    const keys = fuseOptions.fuseOptions!.keys
    const itemsCloned = [...items.value, ...addedItems.value]

    return itemsCloned.map(item => {
      const itemPartial: Record<string, any> = {
        _ref: item,
      }

      keys?.forEach((key: string) => {
        const val = get(item, key as string)

        set(
          itemPartial,
          key as string,
          useToBoldLatin
            ? $toBoldLatin(val?.toString())
            : normalizeText(val?.toString())
        )
      })

      return itemPartial
    })
  })

  function resetAddingItem() {
    preAddedItem.value = undefined
    searchEl.value?.clear()
    search.value = ''
  }

  // Helpers
  const defaultSortBy = [
    new SortItem<any>({
      name: '_label',
      sort: 'asc',
      format: row =>
        typeof props.itemLabel === 'function'
          ? props.itemLabel(row)
          : get(row, props.itemLabel),
    }),
  ]

  const itemsByKey = computed(() => {
    return [
      ...itemsExtended.value,
      ...(preAddedItem.value ? [preAddedItem.value] : []),
    ].reduce((agg, item) => {
      const key = getKey(item._ref ?? item)

      agg[key] = item._ref

      return agg
    }, {})
  })

  const selectedByKey = computed(() => {
    if (isNil(selected.value)) {
      return {}
    }

    // Multi ~ `selected` is an Array
    if (Array.isArray(selected.value)) {
      return selected.value.reduce<Record<string, any>>((agg, sel) => {
        const key = getKey(sel)
        const option = getOption(sel)

        agg[key] = option

        return agg
      }, {})
    }

    // Multi ~ `selected` is an Object
    else if (
      props.multi &&
      typeof selected.value === 'object' &&
      Object.keys(selected.value).length
    ) {
      return Object.keys(selected.value).reduce<Record<string, any>>(
        (agg, key) => {
          const opt = getOption(key)
          agg[key] = opt

          return agg
        },
        {}
      )
    }

    // Single ~ `selected` is String | Number | Object
    else {
      const key = getKey(selected.value)
      const option = getOption(selected.value)

      return { [key]: option }
    }
  })

  function reset() {
    hasMore.value = true
    totalRows.value = 0
  }

  // Data handling
  const hasMore = ref(true)
  const totalRows = ref(0)
  const selected = toRef(props, 'selected')

  function handleSelectFiltered() {
    if (props.noSelect) {
      return
    }

    const itemsToSelect = arr.value
      .filter(item => !('isGroup' in item))
      // @ts-expect-error type
      .map(item => getEmitValue(item.ref))

    self.emit('selected-multiple', itemsToSelect)
  }

  function handleSelectItem(option: any) {
    if (props.noSelect) {
      return
    }

    if ('isGroup' in option && !props.groupsSelectable) {
      return
    }

    // We reset the added items in single mode
    if (!props.multi && !option.ref._isCreate) {
      addedItems.value = []
      self.emit('update:addedItems', addedItems.value)
    }

    // We selected a `preAdded` item
    if ('_isNew' in option.ref && option.ref._isNew) {
      !props.noLocalAdd && addItem(option.ref)

      resetAddingItem()
      handleSelectItem({
        ...option,
        ref: { ...option.ref, _isNew: false, _isCreate: true },
      })

      return
    }

    const isGroup = 'isGroup' in option

    if (!isGroup) {
      const item = option.ref
      const itemKey = getKey(item)

      if (props.multi) {
        // Is already selected
        if (selectedByKey.value[itemKey]) {
          self.emit('removed', item)

          // We are using array for selection
          if (Array.isArray(selected.value)) {
            const idx = selected.value.findIndex(sel => getKey(sel) === itemKey)

            if (idx > -1) {
              const _selected = [...selected.value]
              _selected.splice(idx, 1)

              self.emit('update:selected', _selected)
            }
          }

          // Wr are using object for selection
          else {
            const _selected = klona(selected.value)
            delete _selected[itemKey]

            self.emit('update:selected', _selected)
          }
        }

        // Is not selected
        else {
          self.emit('added', item)

          // We are using array for selection
          if (Array.isArray(selected.value)) {
            self.emit('update:selected', [
              ...selected.value,
              getEmitValue(item),
            ])
          }

          // Wr are using object for selection and some item is already selected
          else if (selected.value) {
            const _selected = klona(selected.value)
            _selected[itemKey] = true

            self.emit('update:selected', _selected)
          }

          // Wr are using object for selection and no item is selected
          else {
            self.emit('update:selected', { [itemKey]: true })
          }
        }
      } else if (!selectedByKey.value[itemKey]) {
        self.emit('added', item)
        self.emit('update:selected', getEmitValue(item))
      }

      const isToBeCreated = '_isCreate' in item && item._isCreate
      // Remove the item from the added items if it was about to be created
      if (isToBeCreated && selectedByKey.value[itemKey] && props.multi) {
        addedItems.value = addedItems.value.filter(
          item => getKey(item) !== itemKey
        )
        self?.emit('update:addedItems', addedItems.value)

        resetAddingItem()
        handleSearchedResults(results.value)
      }
    } else if (props.multi && props.groupsSelectable) {
      // ENHANCEMENT: SELECT ALL ITEMS IN GROUP
    }
  }

  // Searching
  const searchEl = ref<InstanceType<typeof SearchInput>>()
  const search = ref(props.search || '')
  const hasExactMatch = ref(false)
  const arr = ref<Array<IGroupRow | IItem>>([])
  const isPreventFetchData = refAutoReset(false, 150)

  // Extended search
  const extendedSearch = computed(() => {
    if (!search.value) {
      return search.value
    }

    const searchBoldLatin = useToBoldLatin
      ? $toBoldLatin(search.value)
      : search.value

    if (!props.fuseExtendedSearchToken) {
      return searchBoldLatin
    }

    switch (props.fuseExtendedSearchToken) {
      case "'":
        return `'${searchBoldLatin}`

      case '=':
        return `=${searchBoldLatin}`

      case '!':
        return `!${searchBoldLatin}`

      case '^':
        return `^${searchBoldLatin}`

      case '!^':
        return `!^${searchBoldLatin}`

      case '$':
        return `${searchBoldLatin}$`

      case '!$':
        return `!${searchBoldLatin}$`

      default:
        return searchBoldLatin
    }
  })

  const { results } = useFuse(extendedSearch, itemsExtended, fuseOptions)
  const useWorker = computed(() => props.useWorker || items.value.length > 5e3)

  async function handleSearchedResults(res: typeof results.value) {
    const _hasExactMatch = itemsExtended.value.some(
      item => getLabel(item._ref) === search.value
    )
    let highlightedItems: { ref: any; id: string; _highlighted?: string }[] = []

    // When we're not using FE filtering
    if (props.noFilter) {
      highlightedItems = itemsExtended.value.map(item => {
        return {
          ref: item._ref,
          id: getKey(item._ref),
          _highlighted: getLabel(item._ref),
        }
      })
    }

    // Found > 100 ITEMS - do not create highlighted text (performance)
    else if (!search.value || res.length > 100 || props.noHighlight) {
      highlightedItems = res.map(({ item, score }) => {
        return {
          ref: item._ref,
          id: getKey(item._ref),
          _highlighted: getLabel(item._ref),
          score,
        }
      })
    }

    // Create highlighted text
    else {
      const { highlightedResult } = highlight(res, {
        keys: fuseOptions?.fuseOptions?.keys || [],
        searchValue: search.value,
      })

      highlightedItems = highlightedResult.map(({ item, highlighted }) => {
        return {
          ref: item._ref,
          id: getKey(item._ref),
          _highlighted: useToBoldLatin ? getLabel(item._ref) : highlighted,
        }
      })
    }

    const groupBy = props.groupBy.map(g => {
      return new GroupItem({
        ...g,
        format: ({ ref }) => g.format?.(ref) || get(ref, g.field),
      })
    })

    const shouldNotSort =
      props.noSort ||
      (fuseOptions.fuseOptions?.shouldSort &&
        highlightedItems.length !== items.value.length)

    const resultsSorted = shouldNotSort
      ? highlightedItems
      : await sortData(
          highlightedItems,
          (props.sortBy || defaultSortBy).map(s => {
            return new SortItem({
              ...s,
              format: ({ ref }) => s.format?.(ref) || get(ref, s.field),
            })
          }),
          groupBy
        )

    const groupedArray = await groupData(
      resultsSorted,
      groupBy,
      undefined,
      useWorker.value
    )

    const preAddedItem = handleAddOnSearch({
      search: search.value,
      hasExactMatch: _hasExactMatch,
    })

    if (preAddedItem) {
      groupedArray.unshift({
        id: getKey(preAddedItem),
        ref: preAddedItem,
        _highlighted: getLabel(preAddedItem),
      })
    }

    hasExactMatch.value = _hasExactMatch
    arr.value = groupedArray.map(item => {
      return 'isGroup' in item
        ? item
        : { id: item.id, ref: item.ref, _highlighted: item._highlighted }
    })
  }

  // Data fetching
  async function fetchAndSetData(search?: string, options?: IListFetchOptions) {
    if (isLoading.value) {
      return
    }

    if (props.loadData) {
      const mapKey = props.loadData.mapKey ?? config.selector.mapKey

      try {
        options = options ?? {}
        options.currentRowsCount = items.value.length
        options.hasMore = hasMore.value
        options.lastRow = items.value[items.value.length - 1]

        if (options.fetchMore && !hasMore.value) {
          return
        }

        isLoading.value = true

        if (isInitialized.value) {
          self.emit('before-search', {
            hasExactMatch: hasExactMatch.value,
            search,
          })
        }

        const res = await handleRequest(
          abortController => {
            return props.loadData?.fnc({
              search,
              options,
              abortController: abortController(),
            })
          },
          { noResolve: true }
        )

        const resRows = get(
          res,
          props.loadData.countKey || config.selector.countKey
        )

        if (props.loadData.local) {
          items.value = options.fetchMore ? [...items.value, ...res] : res
        } else {
          items.value = options.fetchMore
            ? [...items.value, ...get(res, mapKey)]
            : get(res, mapKey)
        }

        // For some goddamn fucking reason, the assignment above `items.value = ...`
        // needs `nextTick` to properly get the `.length` of the items... What the actual fuck
        await nextTick()

        isPreventFetchData.value = true
        totalRows.value = options.fetchMore
          ? totalRows.value + (resRows || 0)
          : resRows || 0

        hasMore.value = totalRows.value > items.value.length

        await nextTick()

        await handleSearchedResults(results.value)
        await nextTick()

        self.emit('search', { hasExactMatch: hasExactMatch.value, search })

        isLoading.value = false
      } catch (error) {
        isLoading.value = false
        console.error(error)
      }
    }
  }

  // Watchers
  watch(
    search,
    async search => {
      abortController.value?.abort()

      // We need to wait for the previous `abort`
      setTimeout(async () => {
        if (props.loadData?.onSearch) {
          await fetchAndSetData(search)
        } else {
          if (isInitialized.value) {
            self.emit('before-search', {
              hasExactMatch: hasExactMatch.value,
              search,
            })
          }

          await handleSearchedResults(results.value)
          await nextTick()

          self.emit('search', { hasExactMatch: hasExactMatch.value, search })
        }

        isInitialized.value = true
      })
    },
    { immediate: true }
  )

  watch(items, () => {
    if (!isPreventFetchData.value) {
      handleSearchedResults(results.value)
    }
  })

  // Keyboard navigation
  const { hoveredIdx, listEl, handleKey, handleMouseOver } =
    useListKeyboardNavigation({
      listContainerRef,
      handleSelectItem,
      itemsRef: arr,
      selectedRef: selected,
    })

  return {
    isInitialized,
    arr,
    hoveredIdx,
    listEl,
    searchEl,
    isLoading,
    listRowProps,
    search,
    selectedByKey,
    handleKey,
    handleMouseOver,
    handleSelectFiltered,
    handleSelectItem,
    loadData: fetchAndSetData,
    refresh: () => {
      addedItems.value = props.addedItems || addedItems.value
      handleSearchedResults(results.value)
    },
    reset,
  }
}
