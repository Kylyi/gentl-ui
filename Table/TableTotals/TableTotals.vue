¨
<script setup lang="ts">
// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Components
import HorizontalScroller from '~/components/Scroller/HorizontalScroller.vue'
import { type ITableProps } from '~/components/Table/types/table-props.type'

type IProps = {
  columns: TableColumn<any>[]
  getTotalsData: ITableProps['getTotalsData']
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'scrolled', left: number): void
}>()

// Layout
const totalsEl = ref<InstanceType<typeof HorizontalScroller>>()
const columns = toRef(props, 'columns')

const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden)
})

defineExpose({
  syncScroll: (left: number) => {
    if (totalsEl.value) {
      totalsEl.value?.scroll(left)
    }
  },
  updateArrows: () => {
    totalsEl.value?.updateArrows()
  },
})
</script>

<template>
  <HorizontalScroller
    ref="totalsEl"
    class="thead"
    content-class="relative"
    @scrolled="$emit('scrolled', $event)"
  >
    <!-- Columns -->
    <TableTotalCell
      v-for="col in visibleColumns"
      :key="col.field"
      :column="col"
      :get-totals-data="getTotalsData"
    />
  </HorizontalScroller>
</template>

<style lang="scss" scoped>
.thead {
  --apply: flex shrink-0 overflow-hidden relative min-h-$headerHeight;
}
</style>
