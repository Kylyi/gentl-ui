<script setup lang="ts">
// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  columns: TableColumn[]
  noSearch?: boolean
  queryBuilder?: IQueryBuilderRow[]
  search: string
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:search', search: string): void
}>()

// Layout
const search = useVModel(props, 'search', emits)

const searchableColumnLabels = computed(() => {
  return props.columns.filter(col => col.searchable).map(col => col.label)
})
</script>

<template>
  <!-- Search -->
  <SearchInput
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
          value-class="!font-rem-12 color-ca"
          label-class="!font-rem-14"
        />

        <p class="non-searchable-info">
          {{ $t('table.nonSearchableColumnsInfo') }}
        </p>
      </HelpBtn>
    </template>
  </SearchInput>
</template>

<style lang="scss" scoped>
.non-searchable-info {
  @apply text-caption text-xs m-t-4 p-2 rounded-custom bg-ca text-justify
    text-last-center;
}
</style>
