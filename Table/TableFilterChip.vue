<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

const compareValueLabel = computed(() => {
  if (Array.isArray(props.column.compareValue)) {
    return props.column.compareValue.join(', ')
  }

  return props.column.compareValue
})
</script>

<template>
  <div class="table-filter-chip">
    <span
      text="caption"
      color="black dark:white"
    >
      {{ column.label }}
    </span>
    <span text="caption">
      {{ $t(`comparator.${column.comparator}`) }}
    </span>
    <span font="bold">
      {{ compareValueLabel }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.table-filter-chip {
  --apply: flex relative flex-gap-x-1 p-l-3 p-r-2 p-y-1 items-center
    rounded-custom border-custom border-ca;

  &::before {
    --apply: content-empty absolute inset-block-0 left-0 w-1 bg-primary
      rounded-custom;
  }
}
</style>
