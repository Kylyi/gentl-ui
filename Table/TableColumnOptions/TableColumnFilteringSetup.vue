<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Models
import { FilterItem } from '~/libs/Shared/models/filter-item'
import { ComparatorEnum } from '~/libs/App/enums/comparator.enum'
import { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import { tableRefreshKey } from '~/components/Table/provide/table.provide'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// Constants
const TRIGGER_COMPARATORS = [
  ComparatorEnum.IS_EMPTY,
  ComparatorEnum.NOT_IS_EMPTY,
]

// Utils
const { getAvailableComparators } = useTableUtils()

// Injections
const tableRefresh = injectStrict(tableRefreshKey)

// Constants
const BOOLEANISH_COMPARATORS = [ComparatorEnum.IS, ComparatorEnum.NOT_IS]

// Layout
const isFocusPrevented = refAutoReset(true, 50)
const column = toRef(props, 'column')
const filterItemsRef = ref<Array<HTMLElement>>([])

const interactiveColumns = computed(() => {
  return column.value.filters.filter(filter => !filter.nonInteractive)
})

const hasUnusedComparator = computed(() => {
  const availableComparators =
    column.value.comparators ||
    getAvailableComparators(column.value.dataType, {
      includeSelectorComparators: !!column.value.getDistinctData,
      extraComparators: column.value.extraComparators,
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

function focusOnSpecificFilterInput(filterIndex: number) {
  if (config?.table?.focusOnFilterInput) {
    nextTick(() => {
      setTimeout(() => {
        filterItemsRef?.value[filterIndex]?.focus()
      }, 200)
    })
  }
}

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
        extraComparators: column.value.extraComparators,
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

      // Focus on the new added filter input
      focusOnSpecificFilterInput(column.value.filters.length - 1)

      // Trigger the refresh when selecting a comparator that has no values (IS_EMPTY, NOT_IS_EMPTY)
      if (TRIGGER_COMPARATORS.includes(firstNonUsedComparator)) {
        tableRefresh()
      }
    }
  } else {
    const filter = new FilterItem(column.value)

    column.value.filters = [...column.value.filters, filter]

    // Trigger the refresh when selecting a comparator that has no values (IS_EMPTY, NOT_IS_EMPTY)
    if (TRIGGER_COMPARATORS.includes(filter.comparator)) {
      tableRefresh()
    }

    // Focus on the first generated input filter
    focusOnSpecificFilterInput(0)
  }
}

onMounted(() => {
  if (column.value.filters.length === 0) {
    handleAddFilter()
  } else if (column.value.filters.length === 1) {
    focusOnSpecificFilterInput(0)
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
      ref="filterItemsRef"
      :key="idx"
      :filter="filter"
      :column="column"
    />

    <Btn
      v-if="hasUnusedComparator"
      preset="ADD"
      outlined
      :label="$t('table.addFilter')"
      @click="handleAddFilter"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-column-filtering-chips {
  --apply: flex flex-col gap-y-2 p-x-3;
}
</style>
