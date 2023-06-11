<script setup lang="ts">
// TYPES
import { FilterItem } from '~/libs/App/data/models/filter-item'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// INJECTION KEYS
import {
  refreshTableDataKey,
  updateTableStateKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  columns: TableColumn[]
  noSearch?: boolean
  search: string
  searchableColumnLabels?: string[]
  useChips?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:search', search: string): void
}>()

// INJECTIONS
const refreshData = injectStrict(refreshTableDataKey)
const updateTableState = injectStrict(updateTableStateKey)

// LAYOUT
const search = useVModel(props, 'search', emits)

const filterChips = computed(() => {
  return props.columns.reduce((agg, col) => {
    col.filters.forEach(filter => {
      agg.push(filter)
    })

    return agg
  }, [] as FilterItem[])
})

function handleRemoveAllFilters() {
  props.columns.forEach(column => {
    column.filters = []
  })

  refreshData()
  updateTableState({}, state => {
    state.columns.forEach(column => {
      column.filters = []
    })

    return state
  })
}
</script>

<template>
  <!-- CHIPS -->
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

  <!-- SEARCH -->
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

  <!-- FILLER -->
  <div
    v-else
    grow
  />

  <!-- CLEAR ALL FILTERS -->
  <Btn
    v-if="filterChips.length > 0"
    :label="$t('table.removeAllFilters')"
    no-uppercase
    size="sm"
    no-truncate
    color="ca"
    shrink-0
    label-class="whitespace-nowrap"
  >
    <MenuConfirmation
      hide-header
      @ok="handleRemoveAllFilters"
    />
  </Btn>
</template>
