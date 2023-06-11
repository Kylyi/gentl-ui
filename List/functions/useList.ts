import { MaybeElementRef } from '@vueuse/core'
import { UseFuseOptions, useFuse } from '@vueuse/integrations/useFuse'
import { klona } from 'klona'
import { Required } from 'utility-types'

// TYPES
import { IListProps } from '~/components/List/types/list-props.type'
import { IGroupRow, useGrouping } from '~/libs/App/data/functions/useGrouping'

// MODELS
import { GroupItem } from '~/libs/App/data/models/group-item.model'
import { SortItem } from '~/libs/App/data/models/sort-item.model'

// COMPOSITION FUNCTIONS
import { highlight } from '~/components/List/functions/highlightText'
import { useSorting } from '~/libs/App/data/functions/useSorting'
import { useListUtils } from '~/components/List/functions/useListUtils'

// COMPONENTS
import ListVirtualContainer from '~~/components/List/ListVirtualContainer.vue'
import SearchInput from '~~/components/Inputs/SearchInput.vue'

// COMPONENTS

type IItem = {
  ref: any
  id: string
  _highlighted?: string
}

type IListPropsWithDefaults = Required<
  IListProps,
  'items' | 'groupBy' | 'itemKey' | 'itemLabel'
>

export function useList(
  props: IListPropsWithDefaults,
  listContainer: MaybeElementRef<
    InstanceType<typeof ListVirtualContainer> | undefined
  >
) {
  const self = getCurrentInstance()!

  // UTILS
  const { sortData } = useSorting()
  const { groupData } = useGrouping()
  const { getListProps } = useListUtils()

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

  // LIST
  const items = toRef(props, 'items')

  const listRowProps = computed(() => getListProps(props))

  const scrollTo = (index: number) => {
    unref(listContainer)?.scrollToIdx(index)
  }

  // HELPERS
  const defaultSortBy = [
    new SortItem<any>({
      name: '_label',
      sort: 1,
      format: row =>
        typeof props.itemLabel === 'function'
          ? props.itemLabel(row)
          : get(row, props.itemLabel),
    }),
  ]

  const itemsByKey = computedEager(() => {
    return items.value.reduce((agg, item) => {
      const key = getKey(item)

      agg[key] = item

      return agg
    }, {})
  })

  const selectedByKey = computed(() => {
    if (isNil(selected.value)) {
      return {}
    }

    // MULTI ~ SELECTED IS AN ARRAY
    if (Array.isArray(selected.value)) {
      return selected.value.reduce<Record<string, any>>((agg, sel) => {
        const key = getKey(sel)
        const option = getOption(sel)

        agg[key] = option

        return agg
      }, {})
    }

    // MUTLI ~ SELECTED IS AN OBJECT
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

    // SINGLE ~ SELECTED IS STRING | NUMBER | OBJECT
    else {
      const key = getKey(selected.value)
      const option = getOption(selected.value)

      return { [key]: option }
    }
  })

  // DATA HANDLING
  const propsSearch = toRef(props, 'search')
  const selected = toRef(props, 'selected')

  function handleSelectFiltered() {
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

    const isGroup = 'isGroup' in option

    if (!isGroup) {
      const item = option.ref
      const itemKey = getKey(item)

      if (props.multi) {
        if (selectedByKey.value[itemKey]) {
          self.emit('removed', item)

          if (Array.isArray(selected.value)) {
            const idx = selected.value.findIndex(sel => getKey(sel) === itemKey)

            if (idx > -1) {
              const _selected = [...selected.value]
              _selected.splice(idx, 1)

              self.emit('selected', _selected)
            }
          } else {
            const _selected = klona(selected.value)
            delete _selected[itemKey]

            self.emit('selected', _selected)
          }
        } else {
          self.emit('added', item)

          if (Array.isArray(selected.value)) {
            self.emit('selected', [...selected.value, getEmitValue(item)])
          } else if (selected.value) {
            const _selected = klona(selected.value)
            _selected[itemKey] = true

            self.emit('selected', _selected)
          } else {
            self.emit('selected', { [itemKey]: true })
          }
        }
      } else if (!selectedByKey.value[itemKey]) {
        self.emit('added', item)
        self.emit('selected', getEmitValue(item))
      }
    } else if (props.multi && props.groupsSelectable) {
      // ENHANCEMENT: SELECT ALL ITEMS IN GROUP
    }
  }

  // SEARCHING
  const searchEl = ref<InstanceType<typeof SearchInput>>()
  const search = ref(props.search || '')
  const hasExactMatch = ref(false)
  const arr = ref<Array<IGroupRow | IItem>>([])

  const fuseOptions: UseFuseOptions<any> = {
    matchAllWhenSearchEmpty: true,
    fuseOptions: {
      minMatchCharLength: 1,
      threshold: 0.4,
      isCaseSensitive: false,
      includeMatches: true,
      includeScore: true,
      keys: [props.itemLabel],

      ...props.fuseOptions,
    },
  }
  const { results } = useFuse(search, items, fuseOptions)
  const useWorker = computed(() => props.useWorker || items.value.length > 5e3)

  async function handleSearchedResults(res: typeof results.value) {
    let _hasExactMatch = false
    let highlightedItems: { ref: any; id: string; _highlighted?: string }[] = []

    // FOUND > 100 ITEMS - do not create highlighted text (performance)
    if (!search.value || res.length > 100 || props.noHighlight) {
      highlightedItems = res.map(({ item, score }) => {
        _hasExactMatch = _hasExactMatch || score! <= Number.EPSILON

        return {
          ref: item,
          id: getKey(item),
          _highlighted: getLabel(item),
          score,
        }
      })
    }

    // CREATE HIGHLIGHTED text
    else {
      const { highlightedResult, hasExactMatch: HEM } = highlight(res)
      _hasExactMatch = HEM

      highlightedItems = highlightedResult.map(({ item, highlighted }) => ({
        ref: item,
        id: getKey(item),
        _highlighted: highlighted,
      }))
    }

    const groupBy = props.groupBy.map(g => {
      return new GroupItem({
        ...g,
        format: ({ ref }) => g.format?.(ref) || get(ref, g.field),
      })
    })

    const resultsSorted = props.noSort
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

    hasExactMatch.value = _hasExactMatch
    arr.value = groupedArray.map(item => {
      return 'isGroup' in item
        ? item
        : { id: item.id, ref: item.ref, _highlighted: item._highlighted }
    })
  }

  watch(results, async res => {
    await handleSearchedResults(res)
  })

  watch(search, search => {
    setTimeout(() => {
      hoveredIdx.value = firstNonGroupItemIndex.value
      self.emit('search', { hasExactMatch: hasExactMatch.value, search })
    }, 0)
  })

  watch(propsSearch, val => {
    search.value = val || ''
  })

  const firstNonGroupItemIndex = computed(() =>
    arr.value.findIndex(item => !('isGroup' in item))
  )

  // KEYBOARD NAVIGATION
  const listEl = ref<HTMLDivElement>()
  const { focused: isFocused } = useFocusWithin(listEl)
  const preventNextHoverEventRef = autoResetRef(false, 50)
  const hoveredEl = ref<HTMLDivElement | null | undefined>(null)
  const hoveredIdx = ref(-1)
  const groupsJumped = ref(1) // How many groups we jumped over while using keyboard
  const modifier = ref<-1 | 0 | 1>(0) // negative ~ above, positive ~ below

  useIntersectionObserver(
    hoveredEl,
    ([{ intersectionRect, boundingClientRect }]) => {
      const containerEl = unref(listContainer)?.getElement()

      if (!containerEl) {
        return
      }

      if (intersectionRect.height > 0) {
        containerEl.scrollTop +=
          modifier.value * (boundingClientRect.height - intersectionRect.height)
      } else {
        containerEl.scrollTop +=
          modifier.value * boundingClientRect.height * groupsJumped.value

        groupsJumped.value = 1
      }
    }
  )

  function handleMouseOver(item: any, index: number) {
    if (!('isGroup' in item) && !preventNextHoverEventRef.value) {
      hoveredIdx.value = index
    }
  }

  function handleKey(ev: KeyboardEvent) {
    if (!isFocused.value) {
      return
    }

    switch (ev.key) {
      case 'ArrowUp':
        hoveredIdx.value--
        modifier.value = -1
        ev.preventDefault()
        break
      case 'ArrowDown':
        hoveredIdx.value++
        modifier.value = 1
        ev.preventDefault()
        break
      case 'Enter':
        if (hoveredIdx.value !== -1 && arr.value[hoveredIdx.value]) {
          ev.preventDefault()
          ev.stopPropagation()
          ev.stopImmediatePropagation()
          handleSelectItem(arr.value[hoveredIdx.value])
        }

        return
      default:
        return
    }

    const itemSelected = arr.value[hoveredIdx.value]

    // GOT AT THE START OR AT THE END OF THE LIST
    if (!itemSelected) {
      if (hoveredIdx.value < 0) {
        hoveredIdx.value = arr.value.length
        scrollTo(arr.value.length)
      } else {
        hoveredIdx.value = -1
        scrollTo(0)
      }

      handleKey(ev)
    }

    // GOT TO A GROUP
    else if ('isGroup' in itemSelected) {
      groupsJumped.value += 1

      handleKey(ev)
    }

    // GOT TO FIRST NON-GROUP ITEM
    else if (
      hoveredIdx.value === firstNonGroupItemIndex.value &&
      modifier.value === -1
    ) {
      scrollTo(0)
    }

    // REGULAR ITEM
    else {
      nextTick(
        () => (hoveredEl.value = listEl.value?.querySelector('.item--hovered'))
      )
    }

    preventNextHoverEventRef.value = true
  }

  // Initizalize the searched results
  handleSearchedResults(results.value)

  onKeyStroke(['ArrowUp', 'ArrowDown', 'Enter'], handleKey)

  return {
    arr,
    hoveredIdx,
    listEl,
    searchEl,
    listRowProps,
    search,
    selectedByKey,
    handleKey,
    handleMouseOver,
    handleSelectFiltered,
    handleSelectItem,
  }
}
