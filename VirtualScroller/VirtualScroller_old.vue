<script setup lang="ts" generic="T">
import type { CSSProperties } from 'vue'

// Types
import type { IVirtualScrollEvent } from '~/components/VirtualScroller/types/virtual-scroll-event.type'

type IProps = {
  /**
   * The number of rows to render initially
   */
  initialRowsRenderCount?: number

  /**
   * When true, the component will NOT emit scroll events (performance)
   */
  noScrollEmit?: boolean

  /**
   * The overscan (in pixels) for both top and bottom directions
   */
  overscan?: { top?: number; bottom?: number }

  /**
   * The data rows
   */
  rows?: T[]

  /**
   * The height of each row
   */
  rowHeight?: number

  /**
   * The key to use for each row
   */
  rowKey?: keyof T

  /**
   * Watch for width changes
   */
  watchWidth?: boolean
}

type IRow = {
  ref: T
  idx: number
  style: CSSProperties
}

type IVisibleRows = {
  rows: IRow[]
  firstRow: IRow | null
  lastRow: IRow | null
}

const props = withDefaults(defineProps<IProps>(), {
  rowHeight: 40,
  rowKey: 'id' as keyof T,
})

const emits = defineEmits<{
  (e: 'virtual-scroll', payload: IVirtualScrollEvent): void
}>()

defineExpose({
  scrollTo,
  focus: () => virtualScrollEl.value?.focus(),
})

// Utils
const { isDesktopOrTablet } = useDevice()
const lastScrollEvent = ref<Event>()
let lastScrollRow = 0

function getRowKey(row: T) {
  return String(row[rowKey.value])
}

// Constants
const OVERSCAN_PX = { top: 200, bottom: 400 }
const INITIAL_ROWS_RENDER_COUNT =
  props.initialRowsRenderCount ??
  (isDesktopOrTablet
    ? Math.ceil(2160 / props.rowHeight)
    : Math.ceil(1080 / props.rowHeight))

// Layout
const containerEl = ref<HTMLDivElement>()
const virtualScrollEl = ref<HTMLDivElement>()
const isMounted = ref(false)
const rowHeight = toRef(props, 'rowHeight')
const rowKey = toRef(props, 'rowKey') as Ref<keyof T>
const virtualScrollerRect = ref<DOMRect>()

const overscan = computedEager(() => {
  return {
    top: props.overscan?.top ?? OVERSCAN_PX.top,
    bottom: props.overscan?.bottom ?? OVERSCAN_PX.bottom,
  }
})

const heights = ref<number[]>(
  Array.from({ length: props.rows?.length ?? 0 }, () => props.rowHeight)
)

const renderedRows = ref(
  getRenderedRows(0, INITIAL_ROWS_RENDER_COUNT)
) as Ref<IVisibleRows>

const { height, width } = useElementSize(virtualScrollEl)

useScroll(virtualScrollEl, {
  onScroll(ev) {
    handleScrollEvent(ev)

    lastScrollEvent.value = ev
  },
})

const heightsCumulated = computed(() => {
  let height = 0

  return heights.value.map(h => {
    height += h

    return height
  })
})

const virtualScrollStyle = computed(() => {
  return {
    '--rowHeight': `${rowHeight.value}px`,
  }
})

const containerStyle = computed<CSSProperties>(() => {
  return {
    minHeight: `${heights.value.reduce((agg, curr) => agg + curr, 0)}px`,
  }
})

const rowsInViewport = computed(() => {
  const scrollTop =
    (lastScrollEvent.value?.target as HTMLElement)?.scrollTop ?? 0

  const overscanBot = Math.max(
    height.value +
      overscan.value.bottom +
      Math.min(overscan.value.top, scrollTop),
    0
  ) as number

  return Math.ceil(overscanBot / rowHeight.value)
})

function handleScrollEvent(ev?: Event) {
  const scrollY = ((ev?.target as any)?.scrollTop || 1) as number

  const scrollRow = Math.floor(scrollY / rowHeight.value)

  if (scrollRow && scrollRow === lastScrollRow) {
    return
  }

  lastScrollRow = scrollRow

  // NOTE - We get the index of the first row that is visible
  const overscanTop = Math.max(scrollY - overscan.value.top, 1)
  const firstIdx = heightsCumulated.value.findIndex(h => h >= overscanTop)

  const lastIdx = firstIdx + rowsInViewport.value
  const totalSectionHeight = heightsCumulated.value[firstIdx]
  const firstIdxOffset = scrollY - totalSectionHeight
  const translateYBase = scrollY - firstIdxOffset - heights.value[firstIdx]

  renderedRows.value = getRenderedRows(firstIdx, lastIdx, translateYBase)

  if (!props.noScrollEmit) {
    const left = virtualScrollerRect.value?.left ?? 0
    const top = virtualScrollerRect.value?.top ?? 0
    const height = virtualScrollEl.value?.clientHeight ?? 0

    const firstVisibleEl = document
      .elementFromPoint(left + 1, top + 1)
      ?.closest('.virtual-scroll__row') as HTMLElement

    const lastVisibleEl = document
      .elementFromPoint(left + 1, top + height - 1)
      ?.closest('.virtual-scroll__row') as HTMLElement

    if (!firstVisibleEl || !lastVisibleEl) {
      return
    }

    const firstVisibleIdx = Number(firstVisibleEl?.dataset.idx)
    const firstVisibleItem = props.rows![firstVisibleIdx]

    const lastVisibleIdx = Number(lastVisibleEl?.dataset.idx)
    const lastVisibleItem = props.rows![lastVisibleIdx]

    emits('virtual-scroll', {
      visibleStartItem: {
        index: firstVisibleIdx,
        key: getRowKey(firstVisibleItem),
        size: heights.value[firstVisibleIdx],
      },
      visibleEndItem: {
        index: lastVisibleIdx,
        key: getRowKey(lastVisibleItem),
        size: heights.value[lastVisibleIdx],
      },
    })
  }
}

/**
 * Gets the rows that should be rendered
 */
function getRenderedRows(
  firstIdx: number,
  lastIdx: number,
  translateYBase = 0
): IVisibleRows {
  if (!props.rows?.length) {
    return {
      rows: [] as IRow[],
      firstRow: null,
      lastRow: null,
    }
  }

  const _lastIdx = Math.min(lastIdx, props.rows.length - 1)

  let preceedingRowsHeight = 0

  const rows: IRow[] = props.rows
    .slice(firstIdx, _lastIdx + 1)
    .map((row, idx) => {
      const rowStyle: CSSProperties = {}

      if (isMounted.value) {
        rowStyle.transform = `translateY(${
          preceedingRowsHeight + translateYBase
        }px)`
      }

      const rowObj = {
        ref: row,
        idx: firstIdx + idx,
        style: rowStyle,
      }

      preceedingRowsHeight += heights.value[firstIdx + idx]

      return rowObj
    })

  const firstRow = rows[0]
  const lastRow = rows[rows.length - 1]

  return { rows, firstRow, lastRow }
}

/**
 * Scrolls to the row at the given index
 * NOTE - Be aware that this will not work properly if the row heights are not
 * all the same
 */
function scrollTo(idx: number) {
  const scrollY = idx * rowHeight.value

  virtualScrollEl.value?.scrollTo({ top: scrollY })
}

/**
 * When row is mounted, we update the specific height for that row
 */
async function handleMountedRow(node: any) {
  const el = 'el' in node ? node.el : node
  const idx = el.dataset.idx

  if (heights.value[idx] !== el.clientHeight) {
    heights.value[idx] = el.clientHeight
  }
}

watchThrottled(
  width,
  () => {
    const children = Array.from(containerEl.value?.children || [])
    children?.forEach(handleMountedRow)

    handleScrollEvent(lastScrollEvent.value)
  },
  { throttle: 150, leading: true, trailing: true }
)

// FIXME: Currently, we reset the heights on any rows change. It could be more
// efficient to only update the heights of the rows that have changed (~ added)
watch(
  () => props.rows?.length,
  () => {
    handleScrollEvent(lastScrollEvent.value)

    heights.value = Array.from(
      { length: props.rows?.length ?? 0 },
      () => props.rowHeight
    )
  }
)

// Lifecycle
onMounted(() => {
  nextTick(() => {
    isMounted.value = true
    renderedRows.value = getRenderedRows(0, INITIAL_ROWS_RENDER_COUNT)

    virtualScrollerRect.value = virtualScrollEl.value?.getBoundingClientRect()
  })
})
</script>

<template>
  <div
    ref="virtualScrollEl"
    class="virtual-scroll"
    :class="{ 'is-mounted': isMounted }"
    :style="virtualScrollStyle"
    tabindex="0"
  >
    <div
      ref="containerEl"
      class="virtual-scroll__content"
      :style="containerStyle"
    >
      <div
        v-for="row in renderedRows.rows"
        :key="getRowKey(row.ref)"
        :data-idx="row.idx"
        class="virtual-scroll__row"
        :style="row.style"
        @vue:mounted="handleMountedRow"
      >
        <slot
          :row="row.ref"
          :index="row.idx"
        >
          <div
            flex="~ center"
            min-h="$rowHeight"
            border="y-1 blue"
          >
            {{ row.ref }}
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-scroll {
  --apply: relative overflow-auto grow rounded-custom outline-none
    outline-offset-4;

  &__container {
    --apply: relative rounded-custom;
  }

  &__row {
    --apply: min-h-$rowHeight w-full;

    will-change: transform;
  }
}

.virtual-scroll.is-mounted {
  .virtual-scroll__row {
    --apply: absolute;
  }
}
</style>
