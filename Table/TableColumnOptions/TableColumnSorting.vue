<script setup lang="ts">
// MODELS
import { TableColumnState } from '~/components/Table/models/table-column-state.model'
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  columns?: TableColumn[]
  column: TableColumn
  multiSort?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  multiSort: true,
})

// INJECTIONS
const refreshData = injectStrict(refreshTableDataKey)

// UTILS
const updateTableState = injectStrict(updateTableStateKey)

// LAYOUT
const column = toRef(props, 'column')

function handleSort(sortValue: -1 | 0 | 1) {
  column.value.sort = sortValue || undefined

  // Using multisort
  if (props.multiSort && props.columns) {
    if (sortValue === 0) {
      // These are the columns that have higher sortOrder than the current column
      // We need to adjust their number accordingly, so that the order is not broken
      const sortedColumnsAfter = props.columns.filter(
        col =>
          col.sortOrder !== undefined && col.sortOrder > column.value.sortOrder!
      )

      sortedColumnsAfter.forEach(col => {
        col.sortOrder! -= 1
      })
      column.value.sortOrder = undefined
    } else if (!column.value.sortOrder) {
      column.value.sortOrder =
        props.columns.filter(col => col.sortOrder !== undefined).length + 1
    }
  }

  // Update the table state
  updateTableState({}, tableState => {
    const foundColumn = tableState.columns.find(
      column => column.field === props.column.field
    )

    if (foundColumn) {
      foundColumn.sort = props.column.sort
      foundColumn.sortOrder = props.column.sortOrder
    } else {
      tableState.columns.push(new TableColumnState(props.column))
    }

    return tableState
  })

  // Refresh data
  refreshData()
}
</script>

<template>
  <div class="sorting-container">
    <!-- TITLE -->
    <div class="flex flex-gap-x-2 p-x-3 h-11 items-center">
      <span class="sorting-container-title">
        {{ $t('sorting') }}
      </span>
    </div>

    <div
      flex="~ col"
      p="x-2"
    >
      <Btn
        :label="$t('sortAscending')"
        size="sm"
        justify="!start"
        icon="ph:sort-ascending-bold"
        :class="{ 'is-active': column.sort === 1 }"
        @click="handleSort(1)"
      />

      <Btn
        :label="$t('sortDescending')"
        size="sm"
        justify="!start"
        icon="ph:sort-descending-bold"
        :class="{ 'is-active': column.sort === -1 }"
        @click="handleSort(-1)"
      />

      <Btn
        :label="$t('clearSort')"
        size="sm"
        justify="!start"
        icon="ic:round-clear"
        @click="handleSort(0)"
      />
    </div>
  </div>
</template>

<stlye lang="scss" scoped>
.sorting-container {
  --apply: flex flex-col grow overflow-auto shrink-0 p-b-4;

  &-title {
    --apply: font-bold text-caption grow;
  }

  .is-active {
    --apply: bg-primary color-white;
  }
}
</stlye>
