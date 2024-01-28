<script setup lang="ts">
// Types
import type { TableColumn } from '~/components/Table/models/table-column.model'

// Constants
import { NON_VALUE_COMPARATORS } from '~/components/Table/constants/comparator-categories.const'

type IProps = {
  columns: TableColumn[]
}

const props = defineProps<IProps>()

const filterChips = computed(() => {
  return props.columns
    .flatMap(col => col.filters)
    .filter(filter => {
      const isNonValueComparator = NON_VALUE_COMPARATORS.includes(
        filter.comparator
      )

      return (
        !filter.nonInteractive &&
        (filter.value !== undefined || isNonValueComparator)
      )
    })
    .sort((a, b) => a.id - b.id)
})
</script>

<template>
  <div flex="~ items-center">
    <!-- Chips - filter columns -->
    <HorizontalScroller
      grow
      content-class="flex-gap-x-1"
    >
      <TableFilterChip
        v-for="(filter, idx) in filterChips"
        :key="idx"
        :filter="filter"
        :columns="columns"
      />

      <p
        v-if="!filterChips.length"
        text="caption xs"
        leading="37px"
      >
        {{ $t('table.noFilters') }}
      </p>
    </HorizontalScroller>
  </div>
</template>
