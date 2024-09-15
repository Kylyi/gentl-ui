<script setup lang="ts">
import { NuxtLink } from '#components'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Injections
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'

type IProps = Pick<
  ITableProps,
  | 'columns'
  | 'rowHeight'
  | 'to'
  | 'selectionOptions'
  | 'editable'
  | 'rowClass'
  | 'splitRow'
> & {
  index?: number
  rows: any[]
}

const props = withDefaults(defineProps<IProps>(), {
  index: 0,
})

// Injections
const handleSelectRow = injectStrict(tableSelectRowKey, () => {})
const isSelectedRow = injectStrict(tableIsSelectedRowKey, () => false)

// Layout
const dataColumns = computed(() => {
  return props.columns?.filter(col => !col.isHelperCol && !col.hidden) ?? []
})

const isEditable = computed(() => {
  return props.editable === true || props.editable === 'cards'
})

function selectRow(row: any) {
  if (!props.selectionOptions?.disabled && props.selectionOptions?.selectable) {
    handleSelectRow(row)
  }
}
</script>

<template>
  <div
    class="tr__mobile-container"
    :style="{ 'minHeight': `${rowHeight}px`, '--cols': splitRow }"
  >
    <Component
      :is="to?.(row) ? NuxtLink : 'div'"
      v-for="(row, idx) in rows"
      :key="idx"
      class="tr tr__mobile"
      :class="[
        {
          'is-deleted': row.deleted,
          'is-selectable': selectionOptions?.selectable,
          'is-selected': isSelectedRow(row),
        },
        rowClass?.(row),
      ]"
      :data-split-row-idx="idx"
      :to="to?.(row)"
      @click="selectRow(row)"
    >
      <slot :row="row">
        <slot
          name="row-inside"
          mode="grid"
          :row="row"
        />

        <TableCellMobile
          v-for="(col, colIdx) in dataColumns"
          :key="col.field"
          :column="col"
          :row="row"
          :editable="isEditable"
          :column-index="colIdx"
        >
          <slot
            :name="col.name"
            :row="row"
            :idx="idx"
          />
        </TableCellMobile>
      </slot>

      <!-- Used for absolutely position info/element -->
      <slot name="inner" />
    </Component>
  </div>
</template>

<style lang="scss" scoped>
.tr__mobile {
  @apply relative grid p-y-3 p-l-1 p-r-2 rounded-custom overflow-auto border-1
    border-ca gap-x-3 hover:shadow-ca shadow-sm w-full dark:bg-darker bg-white;

  &-container {
    @apply relative w-full grid p-x-2 p-y-1 gap-2;

    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  }

  grid-template-columns: 1fr 2fr;

  &.is-deleted {
    @apply line-through color-ca;
  }

  &.is-selectable {
    @apply cursor-pointer border-2;
  }

  &.is-selected {
    @apply dark:bg-blue-900/30 bg-blue-100/30 border-primary dark:border-blue-600 border-2;
  }
}

.tr__mobile:hover {
  @apply bg-blue-500/10;
}

.tr__mobile:hover {
  @apply bg-blue-500/10;
}
</style>
