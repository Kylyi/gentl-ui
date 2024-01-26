<script setup lang="ts">
// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  columns?: TableColumn[]
  column: TableColumn
}

const props = defineProps<IProps>()

// Layout
const column = toRef(props, 'column')

function handleSort(sortValue?: 'asc' | 'desc', ev?: PointerEvent) {
  column.value.sort = sortValue || undefined

  const isHoldingShift = ev?.shiftKey

  // Using multisort
  if (isHoldingShift && props.columns) {
    if (!sortValue) {
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

  // Using single sort
  else {
    props.columns?.forEach(col => {
      if (col !== column.value || sortValue === undefined) {
        col.sort = undefined
        col.sortOrder = undefined
      } else {
        col.sortOrder = 1
      }
    })
  }
}
</script>

<template>
  <div class="sorting-container">
    <!-- Title -->
    <div class="flex flex-gap-x-2 p-x-3 p-t-2 p-b-1 items-center">
      <span class="sorting-container-title">
        {{ $t('sorting.self') }}
      </span>

      <Btn
        :label="$t('sorting.clear')"
        size="xs"
        color="negative"
        @click="handleSort()"
      />
    </div>

    <div
      grid="~ cols-2"
      m="x-2"
      border="1 ca"
      rounded="custom"
    >
      <Btn
        :label="$t('sorting.asc')"
        size="sm"
        no-uppercase
        color="ca"
        icon="ph:sort-descending-bold"
        class="!rounded-r-0"
        border="r-1 ca"
        :class="{ 'is-active': column.sort === 'asc' }"
        data-cy="sort-asc"
        @click="handleSort('asc', $event)"
      />

      <Btn
        :label="$t('sorting.desc')"
        size="sm"
        no-uppercase
        color="ca"
        class="!rounded-l-0"
        icon="ph:sort-ascending-bold"
        :class="{ 'is-active': column.sort === 'desc' }"
        data-cy="sort-desc"
        @click="handleSort('desc', $event)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sorting-container {
  --apply: flex flex-col grow overflow-auto shrink-0 p-b-4;

  &-title {
    --apply: grow font-bold text-sm;
  }

  .is-active {
    --apply: bg-primary color-white;
  }
}
</style>
