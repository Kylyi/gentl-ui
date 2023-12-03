<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import { tableRefreshKey } from '~/components/Table/provide/table.provide'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  columns: TableColumn[]
  noSearch?: boolean
  queryBuilder?: IQueryBuilderRow[]
  search: string
  useChips?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:search', search: string): void
}>()

// Injections
const tableRefresh = injectStrict(tableRefreshKey)

// Layout
const useChips = props.useChips ?? config.table.useChips
const search = useVModel(props, 'search', emits)

const searchableColumnLabels = computed(() => {
  return props.columns.filter(col => col.searchable).map(col => col.label)
})

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

function handleRemoveAllFilters() {
  props.columns.forEach(column => {
    column.clearFilters()
  })

  tableRefresh()
}
</script>

<template>
  <div
    flex="~ !items-center"
    :class="{ 'bg-ca': !useChips && !noSearch }"
  >
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

      <p
        v-if="!filterChips.length"
        text="caption xs"
        leading="37px"
      >
        {{ $t('table.noFilters') }}
      </p>
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

    <!-- Clear all filters -->
    <Btn
      v-if="filterChips.length > 0"
      no-upeprcase
      shrink-0
      size="xs"
      :label="$t('table.removeQueryBuilderFilters')"
      no-uppercase
      w="20"
      no-truncate
      stacked
      h="full"
      p="!y-0"
      bg="dark:darker"
      color="ca hover:negative"
      border="2 transparent hover:negative"
    >
      <MenuConfirmation
        hide-header
        :no-arrow="false"
        placement="left"
        @ok="handleRemoveAllFilters"
      />
    </Btn>
  </div>
</template>

<style lang="scss" scoped>
.non-searchable-info {
  --apply: text-caption text-xs m-t-4 p-2 rounded-custom bg-ca text-justify
    text-last-center;
}
</style>
