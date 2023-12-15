<script setup lang="ts">
import type { CSSProperties } from 'vue'

type IProps = {
  /**
   * The number of rows to render initially
   */
  initialRowsRenderCount?: number

  /**
   * The data rows
   */
  rows?: any[]

  /**
   * The height of each row
   */
  rowHeight?: number

  /**
   * The key to use for each row
   */
  rowKey?: string | number

  /**
   * Watch for width changes
   */
  watchWidth?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  rowHeight: 40,
  rowKey: 'id',
})

defineExpose({
  scrollTo,
  focus: () => virtualScrollEl.value?.focus(),
})

// Utils
const { isDesktopOrTablet } = useDevice()

// Constants
const INITIAL_ROWS_RENDER_COUNT =
  props.initialRowsRenderCount ??
  (isDesktopOrTablet
    ? Math.ceil(2160 / props.rowHeight)
    : Math.ceil(1080 / props.rowHeight))

// Layout
let lastScrollEvent: Event
const containerEl = ref<HTMLDivElement>()
const virtualScrollEl = ref<HTMLDivElement>()
const isMounted = ref(false)
const rowHeight = toRef(props, 'rowHeight')
const heights = ref<number[]>(
  Array.from({ length: props.rows?.length ?? 0 }, () => props.rowHeight)
)
const visibleRows = ref(getRenderedRows(0, INITIAL_ROWS_RENDER_COUNT))
const { height, width } = useElementSize(virtualScrollEl)

useScroll(virtualScrollEl, {
  onScroll(ev) {
    handleScrollEvent(ev)

    lastScrollEvent = ev
  },
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
  return Math.ceil(height.value / rowHeight.value)
})

function handleScrollEvent(ev?: Event) {
  const scrollY = ((ev?.target as any)?.scrollTop || 1) as number

  // NOTE - We get the index of the first row that is visible
  let totalSectionHeight = 0
  let firstIdx = 0

  while (totalSectionHeight < scrollY) {
    totalSectionHeight += heights.value[firstIdx]
    firstIdx++
  }

  firstIdx--

  const lastIdx = firstIdx + rowsInViewport.value
  const firstIdxOffset = scrollY - totalSectionHeight
  const translateYBase = scrollY - firstIdxOffset - heights.value[firstIdx]

  visibleRows.value = getRenderedRows(firstIdx, lastIdx, translateYBase)
}

/**
 * Gets the rows that should be rendered
 */
function getRenderedRows(
  firstIdx: number,
  lastIdx: number,
  translateYBase = 0
) {
  if (!props.rows?.length) {
    return {
      rows: [],
      firstRow: null,
      lastRow: null,
    }
  }

  let preceedingRowsHeight = heights.value
    .slice(firstIdx, firstIdx)
    .reduce((agg, curr) => agg + curr, 0)

  const rows = props.rows.slice(firstIdx, lastIdx + 1).map((row, idx) => {
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

  const firstRow = rows[firstIdx]
  const lastRow = rows[lastIdx]

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
function handleMountedRow(node: any) {
  const el = 'el' in node ? node.el : node
  const idx = el.dataset.idx
  const clientHeight = el.clientHeight

  if (heights.value[idx] !== clientHeight) {
    heights.value[idx] = clientHeight
  }
}

watchThrottled(
  width,
  () => {
    const children = Array.from(containerEl.value?.children || [])
    children?.forEach(handleMountedRow)

    handleScrollEvent(lastScrollEvent)
  },
  { throttle: 150, leading: true, trailing: true }
)

// FIXME: Currently, we reset the heights on any rows change. It could be more
// efficient to only update the heights of the rows that have changed (~ added)
watch(
  () => props.rows?.length,
  () => {
    heights.value = Array.from(
      { length: props.rows?.length ?? 0 },
      () => props.rowHeight
    )
  }
)

// Lifecycle
onMounted(() => {
  isMounted.value = true
  visibleRows.value = getRenderedRows(0, INITIAL_ROWS_RENDER_COUNT)
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
        v-for="row in visibleRows.rows"
        :key="row.ref[rowKey]"
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
  --apply: overflow-auto grow rounded-custom border-1 border-dashed
    outline-blue-500 outline-offset-4;

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
