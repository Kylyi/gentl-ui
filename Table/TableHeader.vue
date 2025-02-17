<script setup lang="ts">
// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import type { TableColumn } from '~/components/Table/models/table-column.model'

// Functions
import {
  type ISplitter,
  useTableColumnResizing,
} from '~/components/Table/functions/useTableColumnResizing'

// Injections
import {
  tableColumnsKey,
  tableRowsKey,
  tableSelectRowKey,
  tableSelectionKey,
} from '~/components/Table/provide/table.provide'

// Components
import HorizontalScroller from '~/components/Scroller/HorizontalScroller.vue'
import { useAppStore } from '~/libs/App/app.store'

type IProps = {
  minimumColumnWidth?: number
  noAutofit?: boolean
  noLock?: boolean
  rows: any[]
  smallScreen?: boolean
  selectionOptions?: ITableProps['selectionOptions']
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'scrolled', left: number): void
  (e: 'resized', col: TableColumn): void
}>()

// Utils
const { scrollbarWidth } = useOverflow()

// Injections
const selection = injectStrict(tableSelectionKey)
const tableRows = injectStrict(tableRowsKey)
const columns = injectStrict(tableColumnsKey)
const handleSelectRow = injectStrict(tableSelectRowKey)

// Store
const { appState } = storeToRefs(useAppStore())

const {
  headerEl,
  activeSplitter,
  columnSplitters,
  handleFitColumns,
  handleSplitterPointerDown,
} = useTableColumnResizing({
  columns,
  minimumColumnWidth: props.minimumColumnWidth,
})

// Layout
const scrollX = ref(0)
const isRendered = ref(false)

const selectedCount = computed(() => {
  return Object.values(selection.value || {}).filter(Boolean).length
})

const selectionState = computed({
  get() {
    const totalCount = props.rows.length

    return selectedCount.value === totalCount && selectedCount.value > 0
      ? true // Everything is selected
      : selectedCount.value > 0
        ? null // Something is selected
        : false // Nothing is selected
  },
  async set(val: boolean | null) {
    // When using `selectionKey`, we need to make sure we don't select the same row twice
    if (props.selectionOptions?.selectionKey) {
      const uniqRows = uniqBy(props.rows, row => {
        return get(row, props.selectionOptions!.selectionKey!)
      })

      for await (const row of uniqRows) {
        await handleSelectRow(row, { val: !!val })
      }
    } else {
      for await (const row of props.rows) {
        await handleSelectRow(row, { val: !!val })
      }
    }
  },
})

const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden)
})

const scrollerContentClass = computed(() => {
  const classes: ClassType = [
    'relative',
    `auto-fit--${appState.value.table?.fit}`,
  ]

  if (props.smallScreen) {
    classes.push('m-l-2')
    classes.push('gap-1')
  }

  if (isRendered.value) {
    classes.push('is-ready')
  }

  return classes
})

watch(
  () => visibleColumns.value.length,
  () => nextTick(() => headerEl.value?.updateArrows()),
)

// Auto-fitting and auto-stretching columns
if (!props.noAutofit) {
  watchOnce(tableRows, async () => {
    await nextTick()
    handleFitColumns()

    setTimeout(() => {
      isRendered.value = true
    })
  })
}

function handleScroll(x: number) {
  scrollX.value = x
  emits('scrolled', x)
}

function getSplitterLeft(splitter: ISplitter) {
  const { column } = splitter

  // We move the splitter by the scrollX value when the column is frozen
  const offsetX = column.semiFrozen ? scrollX.value : 0

  return `${splitter.left + offsetX - 3}px`
}

defineExpose({
  syncScroll: (left: number) => {
    if (headerEl.value) {
      headerEl.value?.scroll(left)
    }
  },
  updateArrows: () => {
    headerEl.value?.updateArrows()
  },
})
</script>

<template>
  <HorizontalScroller
    ref="headerEl"
    class="thead"
    :content-class="scrollerContentClass"
    :style="{ '--scrollbarWidth': `${scrollbarWidth}px` }"
    data-cy="table-header"
    @scrolled="handleScroll"
  >
    <!-- Columns -->
    <TableHeaderCell
      v-for="(col, idx) in visibleColumns"
      :key="idx"
      :column="col"
      :columns="columns"
      :last="idx === visibleColumns.length - 1"
      :small-screen="smallScreen"
      :no-lock="noLock"
    >
      <template #selection>
        <Checkbox
          v-model="selectionState"
          :label="smallScreen ? `(${selectedCount})` : undefined"
          data-cy="select-all-rows"
        />
      </template>
    </TableHeaderCell>

    <!-- Splitters -->
    <template v-if="!smallScreen">
      <!-- Active splitter -->
      <div
        v-if="activeSplitter"
        class="splitter splitter-active"
        :style="{
          left: `${activeSplitter.left - 3}px`,
          top: `${activeSplitter.top}px`,
          height: `${activeSplitter.height}px`,
        }"
      />

      <!-- Columns splitters -->
      <template v-else>
        <div
          v-for="splitter in columnSplitters"
          :key="splitter.field"
          class="splitter"
          :style="{ left: getSplitterLeft(splitter) }"
          @pointerdown.stop.prevent="handleSplitterPointerDown(splitter, $event)"
        />
      </template>
    </template>
  </HorizontalScroller>
</template>

<style lang="scss" scoped>
.thead {
  @apply flex shrink-0 relative
    bg-$Table-header-bg min-h-$headerHeight;
}
.splitter {
  @apply absolute top-0 bottom-0 w-7px z-5;

  &-active {
    @apply fixed z-$zMax border-x-3px border-ca bg-black dark:bg-white
      cursor-col-resize;
  }

  &:hover {
    @apply border-x-3px border-ca bg-black dark:bg-white cursor-col-resize;
  }
}
</style>
