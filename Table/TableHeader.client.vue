<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// COMPOSITION FUNCTIONS
import { useTableColumnResizing } from '~/components/Table/functions/useTableColumnResizing'

// COMPONENTS
import HorizontalScroller from '~/components/Scroller/HorizontalScroller.vue'

type IProps = {
  columns: TableColumn<any>[]
  minimumColumnWidth?: number
  rows: any[]
  useChips?: boolean
  useServer?: boolean
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'scrolled', left: number): void
}>()

// UTILS
const { scrollbarWidth } = useOverflow()
const { headerEl, activeSplitter, columnSplitters, handleSplitterPointerDown } =
  useTableColumnResizing(props)

// Layout
const columns = toRef(props, 'columns')

defineExpose({
  syncScroll: (left: number) => {
    if (headerEl.value) {
      headerEl.value?.scroll(left)
    }
  },
})
</script>

<template>
  <HorizontalScroller
    ref="headerEl"
    class="thead"
    content-class="relative"
    :style="{ '--scrollbarWidth': `${scrollbarWidth}px` }"
    @scrolled="$emit('scrolled', $event)"
  >
    <!-- COLUMNS -->
    <template
      v-for="(col, idx) in columns"
      :key="idx"
    >
      <div
        v-if="!col.hidden"
        class="th"
        :title="col._label"
        :class="[
          col.headerClasses,
          `col-${col.name}`,
          { 'has-data': !col.isHelperCol },
        ]"
        :style="{ ...col.headerStyle, [`--colWidth`]: col.adjustedWidthPx }"
      >
        <slot :col="col">
          <span
            p="l-2 r-1 y-1"
            grow
            style="overflow-wrap: anywhere"
          >
            {{ col._label }}
          </span>

          <TableColumnFilterBtn
            v-if="!(col.noFilterSort || col.isHelperCol)"
            :column="col"
            :columns="columns"
            :rows="rows"
            m="x-1"
            shrink-0
            :use-server="useServer"
            :use-chips="useChips"
          />
        </slot>
      </div>
    </template>

    <!-- ACTIVE SPLITTER -->
    <div
      v-if="activeSplitter"
      class="splitter splitter-active"
      :style="{
        left: `${activeSplitter.left - 2}px`,
        top: `${activeSplitter.top}px`,
        height: `${activeSplitter.height}px`,
      }"
    />

    <!-- COLUMNS SPLITTERS -->
    <template v-else>
      <div
        v-for="splitter in columnSplitters"
        :key="splitter.field"
        class="splitter"
        :style="{ left: `${splitter.left - 2}px` }"
        @pointerdown.stop.prevent="handleSplitterPointerDown(splitter, $event)"
      />
    </template>
  </HorizontalScroller>
</template>

<style lang="scss" scoped>
.thead {
  --apply: flex shrink-0 overflow-hidden relative
    bg-white dark:bg-darker min-h-$headerHeight;
}

.th {
  --apply: flex shrink-0 items-center font-semibold text-xs uppercase
    border-ca border-b-1 sm:w-$colWidth overflow-hidden;

  &.has-data {
    --apply: border-l-1;
  }

  &:last-of-type {
    --apply: border-r-1;
  }

}

.splitter {
  --apply: absolute top-0 bottom-0 w-7px;

  &-active {
    --apply: fixed z-$zMax border-x-3px border-ca bg-black dark:bg-white
      cursor-col-resize;
  }

  &:hover {
    --apply: border-x-3px border-ca bg-black dark:bg-white cursor-col-resize;
  }
}
</style>
