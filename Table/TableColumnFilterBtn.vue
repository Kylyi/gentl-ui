<script setup lang="ts">
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  rows: any[]
  column: TableColumn<any>
  useChips?: boolean
  useServer?: boolean
}

const props = defineProps<IProps>()

// LAYOUT
const btnClass = computedEager(() => {
  return {
    'is-filtered': !!props.column.compareValue?.length,
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
      <TableColumnSorting :column="column" />
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
