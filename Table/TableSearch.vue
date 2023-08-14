<script setup lang="ts">
// Types
import type { IQueryBuilderRow } from 'components/QueryBuilder/types/query-builder-row-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  columns: TableColumn[]
  noSearch?: boolean
  queryBuilder?: IQueryBuilderRow[]
  search: string
  searchableColumnLabels?: string[]
  useChips?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:search', search: string): void
}>()

// LAYOUT
const search = useVModel(props, 'search', emits)

const filterChips = computed(() => {
  return props.columns
    .flatMap(col => col.filters)
    .filter(filter => {
      return filter.value !== undefined
    })
    .sort((a, b) => a.id - b.id)
})

function handleRemoveAllFilters() {
  props.columns.forEach(column => {
    column.filters = []
  })
}
</script>

<template>
  <div
    v-if="queryBuilder"
    flex="~ gap-2"
  >
    <!-- Search icon -->
    <div
      mi:search
      shrink-0
      w-6
      h-6
      m="t-1.5"
      color="ca"
    />

    <VerticalScroller max-h="96px">
      <QueryBuilderInline
        :items="queryBuilder"
        :columns="columns"
      />
    </VerticalScroller>
  </div>

  <!-- Chips - filter columns -->
  <HorizontalScroller
    v-if="useChips"
    grow
    content-class="flex-gap-x-1"
  >
    <TableFilterChip
      v-for="(filter, idx) in filterChips"
      :key="idx"
      :filter="filter"
      :columns="columns"
    />
  </HorizontalScroller>

  <!-- Search -->
  <SearchInput
    v-else-if="!noSearch"
    v-model="search"
    grow
    size="sm"
    :debounce="500"
  >
    <template #append>
      <HelpBtn placement="bottom-end">
        <MiniCard
          :label="$t('table.searchPossibleInColumns')"
          :value="searchableColumnLabels?.join(', ')"
        />

        <p class="non-searchable-info">
          {{ $t('table.nonSearchableColumnsInfo') }}
        </p>
      </HelpBtn>
    </template>
  </SearchInput>

  <!-- Filler -->
  <div
    v-else
    grow
  />

  <!-- Clear all filters -->
  <Btn
    v-if="filterChips.length > 0"
    :label="$t('table.removeAllFilters')"
    no-uppercase
    size="sm"
    no-truncate
    color="ca"
    shrink-0
    self-center
    label-class="whitespace-nowrap"
  >
    <MenuConfirmation
      hide-header
      @ok="handleRemoveAllFilters"
    />
  </Btn>
</template>
