<script setup lang="ts">
// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import { tableRefreshKey } from '~/components/Table/provide/table.provide'

type IProps = {
  column: TableColumn<any>
  useChips?: boolean
  useServer?: boolean
}

const props = defineProps<IProps>()

// Injections
const tableRefresh = injectStrict(tableRefreshKey)

// Layout
const column = toRef(props, 'column')

function handleClearFilter() {
  column.value.clearFilters()
  tableRefresh()
}
</script>

<template>
  <div class="filter-container">
    <!-- TITLE -->
    <div class="flex flex-gap-x-2 p-x-3 items-center">
      <span class="filter-container-title">
        {{ $t('filtering') }}
      </span>

      <Btn
        :label="$t('clearFilter')"
        color="negative"
        size="xs"
        @click="handleClearFilter"
      />
    </div>

    <TableColumnFilteringSetup
      v-if="useChips"
      :column="column"
    />
  </div>
</template>

<style lang="scss" scoped>
.filter-container {
  --apply: flex flex-col grow overflow-auto;

  &-title {
    --apply: grow font-bold text-sm;
  }
}
</style>
