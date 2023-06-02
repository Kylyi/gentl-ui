<script setup lang="ts">
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  rows: any[]
  column: TableColumn<any>
  columns: TableColumn<any>[]
  useChips?: boolean
  useServer?: boolean
}

const props = defineProps<IProps>()

// LAYOUT
const btnClass = computedEager(() => {
  console.log(props.column)

  return {
    'is-filtered': Array.isArray(props.column.compareValue)
      ? props.column.compareValue.some(val => !isNil(val))
      : !isNil(props.column.compareValue),
    'is-sorted': !!props.column.sort,
  }
})
</script>

<template>
  <Btn
    preset="FILTER"
    :class="btnClass"
    size="sm"
  >
    <MenuProxy
      w="90"
      dense
      hide-header
      position="top"
      content-class="flex flex-col"
    >
      <TableColumnSorting
        :column="column"
        :columns="columns"
      />
      <TableColumnFiltering
        v-if="column.filterable"
        v-bind="props"
      />
    </MenuProxy>
  </Btn>
</template>

<style lang="scss" scoped>
.is-filtered,
.is-sorted {
  --apply: color-primary;
}
</style>
