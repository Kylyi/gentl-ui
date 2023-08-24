<script setup lang="ts">
// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'
import { TableColumn } from '~/components/Table/models/table-column.model'
import { FilterItem } from '~/libs/App/data/models/filter-item'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// Utils
const { getAvailableComparators } = useTableUtils()

// Constants
const BOOLEANISH_COMPARATORS = [ComparatorEnum.IS, ComparatorEnum.NOT_IS]

// Layout
const isFocusPrevented = refAutoReset(true, 50)
const column = toRef(props, 'column')

const interactiveColumns = computed(() => {
  return column.value.filters.filter(filter => !filter.nonInteractive)
})

const hasUnusedComparator = computed(() => {
  const availableComparators =
    column.value.comparators ||
    getAvailableComparators(column.value.dataType, {
      includeSelectorComparators: !!column.value.getDistinctData,
    })

  const columnComparators = column.value.filters.flatMap(filter => {
    const isBooleanishComparator = BOOLEANISH_COMPARATORS.includes(
      filter.comparator
    )

    return isBooleanishComparator ? BOOLEANISH_COMPARATORS : [filter.comparator]
  })

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
    const availableComparators =
      column.value.comparators ||
      getAvailableComparators(column.value.dataType, {
        includeSelectorComparators: !!column.value.getDistinctData,
      })
    const columnComparators = column.value.filters.map(
      filter => filter.comparator
    )

    const firstNonUsedComparator = availableComparators.find(
      comparator => !columnComparators.includes(comparator)
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
      v-for="(filter, idx) in interactiveColumns"
      :key="idx"
      :filter="filter"
      :column="column"
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
