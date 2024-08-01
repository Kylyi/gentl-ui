import type { MaybeElementRef } from '@vueuse/core'

// Types
import type { IGroupRow } from '~/libs/Shared/functions/data/useGrouping'

// Components
import type ListVirtualContainer from '~/components/List/ListVirtualContainer.vue'

export function useListKeyboardNavigation(options: {
  listContainerRef: MaybeElementRef<
    InstanceType<typeof ListVirtualContainer> | undefined
  >
  itemsRef: Ref<Array<IGroupRow | IItem>>
  selectedRef: Ref<IItem | null>
  handleSelectItem: (item: any) => void
}) {
  const {
    listContainerRef,
    itemsRef,
    selectedRef,
    handleSelectItem,
  } = options

  // Utils
  const self = getCurrentInstance()

  // Keyboard navigation
  const listEl = ref<HTMLDivElement>()
  const { focused: isFocused } = useFocusWithin(listEl)
  const preventNextHoverEventRef = autoResetRef(false, 50)
  const hoveredEl = ref<HTMLDivElement>()
  const hoveredIdx = ref(-1)
  const groupsJumped = ref(1) // How many groups we jumped over while using keyboard
  const modifier = ref<number>(0) // negative ~ above, positive ~ below

  const firstNonGroupItemIndex = computed(() =>
    toValue(itemsRef).findIndex(item => !('isGroup' in item)),
  )

  watchEffect(() => {
    if (firstNonGroupItemIndex.value > -1 && isFocused.value && hoveredIdx.value === -1) {
      hoveredIdx.value = firstNonGroupItemIndex.value
    }
  })

  watch(isFocused, isFocused => {
    if (!isFocused && !selectedRef.value) {
      hoveredIdx.value = -1
    }
  })

  useIntersectionObserver(
    hoveredEl,
    ([{ intersectionRect, boundingClientRect }]) => {
      const containerEl = toValue(listContainerRef)?.getElement()

      // I dont know why this was here...
      // const isHoveredFirst = hoveredIdx.value === 0
      // const isHoveredLast = hoveredIdx.value === toValue(itemsRef).length - 1

      if (!containerEl) {
        return
      }

      if (intersectionRect.height > 0) {
        containerEl.scrollTop
          += modifier.value * (boundingClientRect.height - intersectionRect.height)
      } else {
        containerEl.scrollTop
          += modifier.value * boundingClientRect.height * groupsJumped.value
        groupsJumped.value = 1
      }
    },
  )

  function handleMouseOver(item: any, index: number) {
    if (!('isGroup' in item) && !preventNextHoverEventRef.value) {
      hoveredIdx.value = index
    }
  }

  const scrollTo = (index: number) => {
    toValue(listContainerRef)?.scrollToIdx(index)
  }

  function handleKey(
    ev: KeyboardEvent,
    options?: { force?: boolean, repeated?: boolean },
  ) {
    // NOTE: When we get a `repeated` event, it means the user got under or above the list
    // In that case, we need to adjust situations that would lead to stack overflow,
    // for example when PageDown is pressed while there are only few items in the list
    const { force = false, repeated } = options ?? {}

    if (!isFocused.value && !force) {
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

      case 'PageUp':
        hoveredIdx.value -= repeated ? 1 : 5
        modifier.value = repeated ? -1 : -5
        ev.preventDefault()
        break

      case 'PageDown':
        hoveredIdx.value += repeated ? 1 : 5
        modifier.value = repeated ? 1 : 5
        ev.preventDefault()
        break

      case 'Enter':
        if (hoveredIdx.value !== -1 && toValue(itemsRef)[hoveredIdx.value]) {
          ev.preventDefault()
          ev.stopPropagation()
          ev.stopImmediatePropagation()
          handleSelectItem(toValue(itemsRef)[hoveredIdx.value])
        }

        return

      case 'Tab':
        self?.emit('update:selected', toValue(selectedRef))

        break

      default:
        return
    }

    const itemSelected = toValue(itemsRef)[hoveredIdx.value]

    // Got to the start or at the end of the list
    if (!itemSelected) {
      // Got above start
      if (hoveredIdx.value < 0) {
        scrollTo(toValue(itemsRef).length)
        hoveredIdx.value = toValue(itemsRef).length
      }

      // Got under end
      else {
        scrollTo(0)
        hoveredIdx.value = -1
      }

      handleKey(ev, { force: options?.force, repeated: true })
    }

    // Got to a group
    else if ('isGroup' in itemSelected) {
      groupsJumped.value += 1

      handleKey(ev)
    }

    // Got to first non-group item
    else if (
      hoveredIdx.value === firstNonGroupItemIndex.value
      && modifier.value === -1
    ) {
      scrollTo(0)
    }

    // Regular item
    else {
      nextTick(() => {
        hoveredEl.value = listEl.value?.querySelector(
          '.item--hovered',
        ) as HTMLDivElement
      })
    }

    preventNextHoverEventRef.value = true
  }

  onKeyStroke(
    ['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'PageUp', 'PageDown'],
    handleKey,
  )

  return {
    handleKey,
    hoveredIdx,
    handleMouseOver,
    listEl,
  }
}
