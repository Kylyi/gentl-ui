<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'
import { FilterItem } from '~/libs/App/data/models/filter-item'

// INJECTION KEYS
import {
  refreshTableDataKey,
  updateTableStateKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  columns: TableColumn<any>[]
  filter: FilterItem<any>
}

const props = defineProps<IProps>()

// INJECTIONS
const refreshData = injectStrict(refreshTableDataKey)
const updateTableState = injectStrict(updateTableStateKey)

// LAYOUT
const filter = toRef(props, 'filter')

const column = computed(() => {
  return props.columns.find(column => column.field === filter.value.field)!
})

function removeChip(skipRefreshData = false) {
  column.value.filters = column.value.filters.filter(
    filterItem => filterItem.comparator !== filter.value.comparator
  )

  if (!skipRefreshData && filter.value.compareValue) {
    refreshData()
  }

  updateTableState({}, state => {
    const foundStateColumn = state.columns.find(
      _column => _column.field === column.value.field
    )!

    foundStateColumn.filters = foundStateColumn.filters.filter(
      filterItem => filterItem.comparator !== filter.value.comparator
    )
    return state
  })
}

/**
 * When we hide the menu and the filter `compareValue` is `undefined`, we remove the filter
 */
function handleFilteringItemHide() {
  const isArray = Array.isArray(filter.value.compareValue)

  if (
    filter.value.compareValue === undefined ||
    (isArray && !filter.value.compareValue.length)
  ) {
    removeChip(true)
  }
}

function getLabel(_: any, value: any) {
  if (Array.isArray(value)) {
    return value.map(val => val._label).join(', ')
  }
}
</script>

<template>
  <div class="table-filter-chip">
    <!-- COLUMN LABEL -->
    <span class="filter-field">
      {{ column.label }}
    </span>

    <!-- COMPARATOR -->
    <span
      text="caption"
      whitespace="nowrap"
    >
      {{ $t(`comparator.${filter.comparator}`) }}
    </span>

    <!-- COMPARE VALUE -->
    <ValueFormatter
      :data-type="filter.dataType"
      :value="filter.compareValue"
      :format="Array.isArray(filter.compareValue) ? getLabel : undefined"
    >
      <template #default="{ val }">
        <span class="filter-value">
          {{ val }}
        </span>
      </template>
    </ValueFormatter>

    <!-- REMOVE BTN -->
    <Btn
      size="xs"
      preset="CLOSE"
      m="l-1"
      @click.stop.prevent="removeChip(false)"
    />

    <Menu
      hide-header
      @before-hide="handleFilteringItemHide"
    >
      <TableColumnFilteringItem
        :filter="filter"
        :column="column"
        no-delete
      />
    </Menu>
  </div>
</template>

<style lang="scss" scoped>
.table-filter-chip {
  --apply: flex relative flex-gap-x-1 p-l-3 p-r-1 p-y-1 items-center cursor-pointer
    rounded-custom border-custom border-ca dark:bg-darker bg-white
  shadow-ca hover:shadow-consistent-sm;

  &::before {
    --apply: content-empty absolute inset-block-0 left-0 w-1 bg-primary
      rounded-l-custom;
  }
}

.filter-field,
.filter-value {
  --apply: whitespace-nowrap text-caption color-black dark:color-white;
}
</style>
