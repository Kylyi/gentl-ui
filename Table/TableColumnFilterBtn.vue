<script setup lang="ts">
import { Placement } from '@floating-ui/dom'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  rows: any[]
  column: TableColumn<any>
  columns: TableColumn<any>[]
  useChips?: boolean
  useServer?: boolean
  placement?: Placement
  offset?: number
  referenceTarget?: any
}

const props = defineProps<IProps>()

// LAYOUT
const column = toRef(props, 'column')

const btnClass = computedEager(() => {
  return {
    'is-filtered': !!props.column.filters.length,
    'is-sorted': !!props.column.sort,
  }
})

/**
 * On menu hide, we remove the filter if the `compareValue` is `undefined`
 */
function handleMenuHide() {
  column.value.filters = column.value.filters.filter(filterItem => {
    if (Array.isArray(filterItem.compareValue)) {
      return filterItem.compareValue.length
    }

    return filterItem.compareValue !== undefined
  })
}
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
      :placement="placement"
      :offset="offset"
      :reference-target="referenceTarget"
      content-class="flex flex-col"
      @before-hide="handleMenuHide"
    >
      <TableColumnSorting
        v-if="column.sortable"
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
