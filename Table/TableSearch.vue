<script setup lang="ts">
import { TableColumn } from '~/components/Table/models/table-column.model'

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

const refreshData = inject(refreshTableDataKey, () => {})

// LAYOUT
const search = useVModel(props, 'search', emits)

const filteredColumns = computed(() => {
  return props.columns.filter(col => col.compareValue)
})
</script>

<template>
  <!-- CHIPS -->
  <div
    v-if="useChips"
    flex="~ gap-x-1"
    items-center
    grow
  >
    <TableFilterChip
      v-for="(col, idx) in filteredColumns"
      :key="idx"
      :column="col"
    />
  </div>

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
</template>
