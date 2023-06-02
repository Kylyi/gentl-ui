<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// INJECTIONS
const refreshData = inject(refreshTableDataKey, () => {})
const updateTableState = inject(updateTableStateKey, () => {})

// LAYOUT
const column = toRef(props, 'column')

const compareValueLabel = computed(() => {
  if (Array.isArray(props.column.compareValue)) {
    return props.column.compareValue.join(', ')
  }

  return props.column.compareValue
})

function removeChip() {
  column.value.compareValue = null
  refreshData()

  updateTableState({}, tableState => {
    const foundColumn = tableState.columns.find(
      column => column.field === props.column.field
    )

    if (foundColumn) {
      foundColumn.compareValue = props.column.compareValue
    } else {
      tableState.columns.push({
        field: props.column.field,
        comparator: props.column.comparator,
        width: props.column.width,
        sort: props.column.sort,
        sortOrder: props.column.sortOrder,
        compareValue: props.column.compareValue,
      })
    }

    return tableState
  })
}
</script>

<template>
  <div class="table-filter-chip">
    <!-- COLUMN LABEL -->
    <span
      text="caption"
      color="black dark:white"
    >
      {{ column.label }}
    </span>

    <!-- COMPARATOR -->
    <span text="caption">
      {{ $t(`comparator.${column.comparator}`) }}
    </span>

    <!-- COMPARE VALUE -->
    <ValueFormatter
      :data-type="column.dataType"
      :value="compareValueLabel"
    >
      <template #default="{ val }">
        <span font="bold">
          {{ val }}
        </span>
      </template>
    </ValueFormatter>

    <!-- REMOVE BTN -->
    <Btn
      size="xs"
      preset="CLOSE"
      m="l-1"
      @click="removeChip"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-filter-chip {
  --apply: flex relative flex-gap-x-1 p-l-3 p-r-1 p-y-1 items-center
    rounded-custom border-custom border-ca dark:bg-darker bg-white;

  &::before {
    --apply: content-empty absolute inset-block-0 left-0 w-1 bg-primary
      rounded-custom;
  }
}
</style>
