<script setup lang="ts">
// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Functions
import {
  ISplitter,
  useTableColumnResizing,
} from '~/components/Table/functions/useTableColumnResizing'

// Injections
import { tableSelectionKey } from '~/components/Table/provide/table.provide'

// Components
import HorizontalScroller from '~/components/Scroller/HorizontalScroller.vue'

type IProps = {
  columns: TableColumn<any>[]
  minimumColumnWidth?: number
  rows: any[]
  useChips?: boolean
  useServer?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'scrolled', left: number): void
}>()

// Utils
const { scrollbarWidth } = useOverflow()
const { headerEl, activeSplitter, columnSplitters, handleSplitterPointerDown } =
  useTableColumnResizing(props)

// Injections
const selection = injectStrict(tableSelectionKey)

// Layout
const columns = toRef(props, 'columns')
const scrollX = ref(0)

const selectionState = computed({
  get() {
    const selectedCount = Object.values(selection.value || {}).filter(
      Boolean
    ).length
    const totalCount = props.rows.length

    return selectedCount === totalCount && selectedCount > 0
      ? true // Everything is selected
      : selectedCount > 0
      ? null // Something is selected
      : false // Nothing is selected
  },
  set(val: boolean | null) {
    if (val === false) {
      selection.value = {}
    } else {
      selection.value = props.rows.reduce((agg, row) => {
        agg[row.id] = val

        return agg
      }, {} as Record<string, boolean>)
    }
  },
})

const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden)
})

watch(
  () => visibleColumns.value.length,
  () => nextTick(() => headerEl.value?.updateArrows())
)

function handleScroll(x: number) {
  scrollX.value = x
  emits('scrolled', x)
}

function getSplitterLeft(splitter: ISplitter) {
  const { column } = splitter

  // We move the splitter by the scrollX value when the column is frozen
  const offsetX = column.semiFrozen ? scrollX.value : 0

  return `${splitter.left + offsetX - 2}px`
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
    content-class="relative"
    :style="{ '--scrollbarWidth': `${scrollbarWidth}px` }"
    @scrolled="handleScroll"
  >
    <!-- Columns -->
    <template
      v-for="(col, idx) in visibleColumns"
      :key="idx"
    >
      <div
        class="th"
        :class="[
          col.headerClasses,
          `col-${col.name}`,
          {
            'has-data': !col.isHelperCol,
            'is-frozen': col.frozen,
            'is-semi-frozen': col.semiFrozen,
          },
        ]"
        :style="{ ...col.headerStyle, [`--colWidth`]: col.adjustedWidthPx }"
      >
        <slot :col="col">
          <span
            v-if="col._label"
            :title="col._label"
            class="th-label"
          >
            {{ col._label }}&nbsp;
          </span>

          <div v-if="col.name === '_selectable'">
            <Checkbox v-model="selectionState" />
          </div>

          <div
            flex="~ items-center"
            relative
          >
            <TableColumnFreezeBtn
              v-if="!col.isHelperCol"
              :column="col"
              :columns="columns"
              position="!absolute"
              left="-7"
              backdrop-blur="sm"
            />

            <TableColumnFilterBtn
              v-if="!(col.noFilterSort || col.isHelperCol)"
              :column="col"
              :columns="columns"
              m="x-1"
              shrink-0
              :use-server="useServer"
              :use-chips="useChips"
            />
          </div>
        </slot>
      </div>
    </template>

    <!-- Active splitter -->
    <div
      v-if="activeSplitter"
      class="splitter splitter-active"
      :style="{
        left: `${activeSplitter.left - 2}px`,
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
  </HorizontalScroller>
</template>

<style lang="scss" scoped>
.thead {
  --apply: flex shrink-0 relative
    bg-white dark:bg-darker min-h-$headerHeight;
}

.th {
  --apply: flex shrink-0 items-center font-semibold text-xs tracking-wide
    border-ca border-b-1 sm:w-$colWidth;

  &.has-data {
    --apply: border-l-1;
  }

  &:last-of-type {
    --apply: border-r-1;
  }

  &-label {
    --apply: grow p-l-2 p-r-1 line-clamp-2;

    &::after {
      content: '\00a0';
    }
  }
}

.splitter {
  --apply: absolute top-0 bottom-0 w-7px z-5;

  &-active {
    --apply: fixed z-$zMax border-x-3px border-ca bg-black dark:bg-white
      cursor-col-resize;
  }

  &:hover {
    --apply: border-x-3px border-ca bg-black dark:bg-white cursor-col-resize;
  }
}

.th.is-semi-frozen {
  --apply: z-6;

  &::after {
    --apply: content-empty absolute -right-px top-0 h-full w-px bg-primary;
  }
}

.column-lock {
  --apply: display-none;
}

.th:hover .column-lock,
.th.is-frozen .column-lock {
  --apply: display-flex;
}
</style>
