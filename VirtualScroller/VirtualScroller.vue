<script setup lang="ts">
import { CSSProperties } from 'vue'

// Functions
import { useVirtualScrollerUtils } from '~/components/VirtualScroller/functions/useVirtualScrollerUtils'

type IProps = {
  emitEnabled?: boolean
  items: any[]
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'v-scroll', payload: { startIndex: number; endIndex: number }): void
}>()

defineExpose({
  scrollTo,
})

const PAGE_SIZE = 100

// Utils
const { binarySearch, findStartNode, doesBrowserSupportPassiveScroll } =
  useVirtualScrollerUtils()

// Layout
const self = getCurrentInstance()
const itemRefs = ref<HTMLElement[]>([])
const virtualScrollerEl = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()
const viewportEl = ref<HTMLElement>()
const isEmitEnabled = toRef(props, 'emitEnabled')
const isMounted = ref(false)
// const isLoading = ref(false)
const items = toRef(props, 'items')

function setRef(el: any, id: number) {
  if (el) {
    itemRefs.value[id] = el
  }
}

// Virtual scrolling - Initialization
// Height of the smallest row
const smallestRowHeight = ref(Number.MAX_SAFE_INTEGER)

// Height of the largest row
const largestRowHeight = ref(Number.MIN_SAFE_INTEGER)

// The height of each item in the list
const heights = ref<number[]>([])

// Index of the starting page, each page has PAGE_SIZE items
const pageStartIndex = ref(0)

// Index of the first list item on DOM
const startIndex = ref(0)

// Index of the last list item on DOM
const endIndex = ref(PAGE_SIZE)

// How much to shift the content vertically so that the scrollbar is not disturbed when hiding items
const translateY = ref(0)

// Height of the outermost div inside which all the list items are present
const rootHeight = ref(0)

// Total height of all the rows of all the pages
const viewportHeight = ref(0)

// Current scroll position
const scrollTop = ref(0)

// Total height per page
// On page 0 , lets say all PAGE_SIZE rows add up to 2000
// On page 1, lets say all PAGE_SIZE rows add up to 2500, then
// rollingPageHeights: [2000, 4500]
// page 1 = page 0 height of PAGE_SIZE items + page 1 height of PAGE_SIZE items
const rollingPageHeights = ref<number[]>([])

// The id of the currently selected item, by default set to 0
// const selectedIndex = ref(0)

/**
 * If the current page is 0, take a slice of the heights of all rows from index 0 to 49
 *  If the current page is 1, the slice goes from index 50 to 99
 *  We need the total height till the end of wherever we will scroll to
 * Let's say we have scrolled 2 pages down, page 0 and page 1
 * Page 0 had 50 rows with a height of 2000 px
 * For page 0, total height is 2000px
 * Page 1 had 50 rows with a height of 2500 px
 * For page 1, total height is 2000 + 2500 = 4500px and this goes on increasing with each page
 * rollingPageHeights currently would contain an array [2000, 4500]
 * For any scroll top less than 2000, we know that we are on page 0 now
 * Now we try to find how far each row is from the top of its current page
 * If page 0 has 50 rows with heights say 25 30 35 40 ...
 * Row 1 of page 0 is 0 from top of page 0
 * Row 2 of page 0 is 25 from top of page 0
 * Row 3 of page 0 is 25 + 30 = 55 from top of page 0
 * Row 4 of page 0 is 25 + 30 + 35 = 90 from top of page 0
 * If page 1 has 50 rows with heights 25 30 35 40, remember that page 1 itself is 2000px from top of the viewport
 * Row 0 of page 1 is 0 + 2000 from top of page 1
 * Row 1 of page 1 is 25 + 2000 = 2025 from top of page 1
 * Row 2 of page 1 is 25 + 30 + 2000 = 2055 from top of page 1
 * Row 3 of page 1 is 25 + 30 + 35 + 2000 = 2090 from top of page 1
 * We ll get a bunch of ever increasing numbers for a given page and we need to
 * find out where the scroll top lies to identify the start index
 */
const rowPositions = computed(() => {
  const currentHeights = heights.value.slice(
    pageStartIndex.value * PAGE_SIZE,
    (pageStartIndex.value + 1) * PAGE_SIZE
  )

  let totalDisplacement =
    rollingPageHeights.value[pageStartIndex.value - 1] || 0
  const displacements = []

  for (let i = 0; i < currentHeights.length; i++) {
    displacements.push(totalDisplacement)
    totalDisplacement += currentHeights[i]
  }

  displacements.push(totalDisplacement)

  return displacements
})

/**
	Subset of list items rendered on the DOM
	*/
const visibleItems = computed(() => {
  return items.value.slice(startIndex.value, endIndex.value)
})

/**
  Translate the content verticaly to keep the scrollbar intact
  We only show N items at a time so the scrollbar would get affected if we dont translate
*/
const spacerStyle = computed(() => {
  return {
    willChange: 'auto',
    transform: `translateY(${translateY.value}px)`,
  }
})

/**
  Set the height of the viewport
  For a list where all items are of equal height, height of the viewport = number of items x height of each item
  For a list where all items are of different height, it is the sum of height of each row
*/
const viewportStyle = computed<CSSProperties>(() => {
  return {
    height: `${viewportHeight.value}px`,
    overflow: 'hidden',
    position: 'relative',
    willChange: 'auto',
  }
})

function init() {
  isMounted.value = true
  // Insert the dummy data
  // const insertedItems = this.dummyData(items.value.length)
  // items.value.push(...insertedItems)

  const el = self?.proxy?.$el

  // Check if browser supports passive scroll and add scroll event listener
  el?.addEventListener(
    'scroll',
    handleScroll,
    doesBrowserSupportPassiveScroll() ? { passive: true } : false
  )

  // window.addEventListener('keydown', handleKeyDown)

  // After the items are added when they are rendered on DOM, update the heights and other properties
  nextTick(() => {
    update(items.value)
    // Observe one or multiple elements
    // this.isEmitEnabled && this.emit()
  })
}

// function select(itemId: number) {
//   selectedIndex.value = itemId
// }

function scrollTo(index: number) {
  const el = self?.proxy?.$el
  const pageStartIndex = Math.floor(index / PAGE_SIZE)

  const currentHeights = heights.value.slice(
    pageStartIndex * PAGE_SIZE,
    (pageStartIndex + 1) * PAGE_SIZE
  )
  let totalDisplacement = rollingPageHeights.value[pageStartIndex - 1] || 0
  const displacements = []

  for (let i = 0; i < currentHeights.length; i++) {
    displacements.push(totalDisplacement)
    totalDisplacement += currentHeights[i]
  }
  displacements.push(totalDisplacement)

  const top = displacements[index % PAGE_SIZE]
  const isVisible =
    top >= scrollTop.value && top <= scrollTop.value + el.offsetHeight

  if (!isVisible) {
    el.scrollTo({
      left: 0,
      top: displacements[index % PAGE_SIZE],
      behavior: 'smooth',
    })
  }
}

// function handleKeyDown() {
//   switch (event.keyCode) {
//     // In case of left arrow key move to the last item
//     case 37:
//       if (selectedIndex.value > 0) {
//         select(selectedIndex.value - 1)
//         scrollTo(selectedIndex.value)
//       }
//       // Prevent the default scroll event from firing
//       event.preventDefault()
//       break
//     // In case of up arrow key, move to the last item
//     case 38:
//       if (selectedIndex.value > 0) {
//         select(selectedIndex.value - 1)
//         scrollTo(selectedIndex.value)
//       }
//       event.preventDefault()
//       break
//     // In case of right arrow key, move to the next item
//     case 39:
//       if (selectedIndex.value < items.value.length - 1) {
//         select(selectedIndex.value + 1)
//         scrollTo(selectedIndex.value)
//       }
//       event.preventDefault()
//       break
//     // In case of down arrow key, move to the next item
//     case 40:
//       if (selectedIndex.value < items.value.length - 1) {
//         select(selectedIndex.value + 1)
//         scrollTo(selectedIndex.value)
//       }
//       event.preventDefault()
//       break
//   }
// }

function update(insertedItems: any[]) {
  const el = self?.proxy?.$el

  for (let i = 0; i < insertedItems.length; i++) {
    // Get the id and index of the inserted items from the array
    const { id, index } = insertedItems[i]

    // Check if the id has been rendered on DOM and is available
    if (itemRefs.value[id] && itemRefs.value[id]) {
      // Get the scroll height and update the height of the item at index
      const height = itemRefs.value[id].scrollHeight
      heights.value[index] = height
      // Update the largest and smallest row heights
      largestRowHeight.value =
        height > largestRowHeight.value ? height : largestRowHeight.value
      smallestRowHeight.value =
        height < smallestRowHeight.value ? height : smallestRowHeight.value

      // Given an item index, compute the page index
      // For example, any item index from 0 to 40 would translate to page index 0
      // Any item with index 50 to 99 would translate to page index 1
      const pageIndex = Math.floor(index / PAGE_SIZE)

      if (pageIndex === 0) {
        if (!rollingPageHeights.value[pageIndex]) {
          rollingPageHeights.value[pageIndex] = 0
        }
      } else if (!rollingPageHeights.value[pageIndex]) {
        rollingPageHeights.value[pageIndex] =
          rollingPageHeights.value[pageIndex - 1]
      }
      // Add the height of the row to the total height of all rows on the current page
      rollingPageHeights.value[pageIndex] += height
    }
  }

  rootHeight.value = el?.offsetHeight

  // Total height of the viewport is the sum of heights of all the rows on all the pages currently stored at the last index of page positions
  // For our example with page 0 of 2000px and page 1 of 2500px, the rollingPageHeights array looks like [2000, 4500]
  // Viewport height = 4500px
  viewportHeight.value =
    rollingPageHeights.value[rollingPageHeights.value.length - 1]
}

const handleScroll = useThrottleFn(
  () => {
    const el = self?.proxy?.$el

    const { scrollTop: _scrollTop, offsetHeight, scrollHeight } = el
    scrollTop.value = _scrollTop
    // isEmitEnabled.value && this.emit()

    if (_scrollTop + offsetHeight >= scrollHeight - 10) {
      // loadMore()
    }
  },
  17,
  true,
  true
)

watch(scrollTop, scrollTop => {
  pageStartIndex.value = binarySearch(rollingPageHeights.value, scrollTop)

  const startNodeIndex = Math.max(
    0,
    findStartNode(scrollTop, rowPositions.value, rowPositions.value.length)
  )
  startIndex.value = pageStartIndex.value * PAGE_SIZE + startNodeIndex

  endIndex.value =
    startIndex.value + Math.floor(rootHeight.value / smallestRowHeight.value)

  translateY.value = rowPositions.value[startNodeIndex]

  if (isEmitEnabled.value) {
    emits('v-scroll', {
      startIndex: startIndex.value,
      endIndex: endIndex.value,
    })
  }
})

// Lifecycle
onMounted(() => {
  init()
})

onUnmounted(() => {
  const el = self?.proxy?.$el

  el?.removeEventListener('scroll', handleScroll)
  // window.removeEventListener('keydown', this.handleKeyDown)
  isMounted.value = false
})
</script>

<template>
  <div
    ref="virtualScrollerEl"
    class="virtual-scroller"
  >
    <div
      ref="viewportEl"
      class="virtual-scroller__viewport"
      :style="viewportStyle"
    >
      <div
        ref="contentEl"
        class="virtual-scroller__content"
        :style="spacerStyle"
      >
        <div
          v-for="i in visibleItems"
          :key="i.id"
          :ref="el => setRef(el, i.id)"
          class="list-item"
          :class="{ 'is-even': i.index % 2 }"
          :data-index="i.index"
        >
          <div>{{ `${i.index} ${i.value}` }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-scroller {
  height: 100%;
  overflow: auto;

  &__viewport {
    --apply: w-min;
  }

  &__content {
    --apply: w-min;

    .is-even {
      --apply: bg-ca;
    }
  }
}

.list-item {
  padding: 0.75rem 0.25rem;
  width: 1200px;
}
</style>
