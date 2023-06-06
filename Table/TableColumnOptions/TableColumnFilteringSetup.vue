<script setup lang="ts">
// MODELS
import { VNode } from 'nuxt/dist/app/compat/capi'
import { useTableUtils } from '~/components/Table/functions/useTableUtils'
import { TableColumn } from '~/components/Table/models/table-column.model'
import { FilterItem } from '~/libs/App/data/models/filter-item'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// UTILS
const { getAvailableComparators } = useTableUtils()

// LAYOUT
const isFocusPrevented = refAutoReset(true, 50)
const column = toRef(props, 'column')

const hasUnusedComparator = computed(() => {
  const availableComparators = getAvailableComparators(column.value.dataType, {
    includeSelectorComparators: !!column.value.getDistinctData,
  })
  const columnComparators = column.value.filters.map(
    filter => filter.comparator
  )

  return availableComparators.some(
    comparator => !columnComparators.includes(comparator)
  )
})

function handleAddFilter() {
  isFocusPrevented.value = false

  const isDefaultComparatorUsed = column.value.filters.some(
    filter => filter.comparator === column.value.comparator
  )

  if (isDefaultComparatorUsed) {
    const availableComparators = getAvailableComparators(
      column.value.dataType,
      {
        includeSelectorComparators: !!column.value.getDistinctData,
      }
    )
    const columnComparators = column.value.filters.map(
      filter => filter.comparator
    )

    const firstNonUsedComparator = availableComparators.find(
      comparator => !columnComparators.includes(comparator)
    )
    console.log(
      'Log ~ handleAddFilter ~ firstNonUsedComparator:',
      firstNonUsedComparator
    )

    if (firstNonUsedComparator) {
      column.value.filters = [
        ...column.value.filters,
        new FilterItem({
          ...column.value,
          comparator: firstNonUsedComparator,
        }),
      ]
    }
  } else {
    column.value.filters = [
      ...column.value.filters,
      new FilterItem(column.value),
    ]
  }
}

function handleFocusInput(node: VNode) {
  setTimeout(() => node.component?.exposed?.focus?.(), 300)
}

onMounted(() => {
  if (column.value.filters.length === 0) {
    handleAddFilter()
  }
})
</script>

<template>
  <div
    :key="column.filters.length"
    class="table-column-filtering-chips"
  >
    <TableColumnFilteringItem
      v-for="(filter, idx) in column.filters"
      :key="idx"
      :filter="filter"
      :column="column"
      @vue:mounted="handleFocusInput"
    />

    <Btn
      v-if="hasUnusedComparator"
      preset="ADD"
      :label="$t('table.addFilter')"
      @click="handleAddFilter"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-column-filtering-chips {
  --apply: flex flex-col flex-gap-y-2 p-x-3 p-y-2;
}
</style>
