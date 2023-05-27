<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  columns: TableColumn<any>[]
  rows: any[]
  useChips?: boolean
  useServer?: boolean
}

const props = defineProps<IProps>()

const headerEl = ref<HTMLDivElement>()
const columns = toRef(props, 'columns')

defineExpose({
  syncScroll: (left: number) => {
    if (headerEl.value) {
      headerEl.value.scrollLeft = left
    }
  },
})
</script>

<template>
  <HorizontalScroller
    ref="headerEl"
    class="thead"
  >
    <div
      v-for="(col, idx) in columns"
      :key="idx"
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
          p="l-2 r-1"
          truncate
          grow
        >
          {{ col._label }}
        </span>

        <TableColumnFilterBtn
          v-if="!(col.hideFilters || col.isHelperCol)"
          :column="col"
          :rows="rows"
          m="x-1"
          :use-server="useServer"
          :use-chips="useChips"
        />
      </slot>
    </div>
  </HorizontalScroller>
</template>

<style lang="scss" scoped>
.thead {
  --apply: flex shrink-0 overflow-hidden relative h-$headerHeight
    bg-white dark:bg-darker;
}

.th {
  --apply: flex shrink-0 items-center font-semibold text-xs uppercase
    border-ca border-b-1 sm:w-$colWidth;

  &.has-data {
    --apply: border-l-1;
  }

  &:last-of-type {
    --apply: border-r-1;
  }
}
</style>
