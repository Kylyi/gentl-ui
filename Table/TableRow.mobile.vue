<script setup lang="ts">
import { NuxtLink } from '#components'

// Types
import { type ITableProps } from '~/components/Table/types/table-props.type'

// Injections
import { tableIsSelectedRowKey } from '~/components/Table/provide/table.provide'

type IProps = Pick<
  ITableProps,
  'columns' | 'rowHeight' | 'to' | 'selectionOptions' | 'editable'
> & {
  index?: number
  row: any
}

const props = withDefaults(defineProps<IProps>(), {
  index: 0,
})

// Injections
const isSelectedRow = injectStrict(tableIsSelectedRowKey, () => false)

// Layout
const dataColumns = computed(() => {
  return props.columns?.filter(col => !col.isHelperCol && !col.hidden) ?? []
})

const isEditable = computedEager(() => {
  return props.editable === true || props.editable === 'cards'
})
</script>

<template>
  <Component
    :is="to?.(row) ? NuxtLink : 'div'"
    class="tr__mobile-container"
    :style="{ minHeight: `${rowHeight}px` }"
    :to="to?.(row)"
  >
    <div
      class="tr tr__mobile"
      :class="{
        'is-deleted': row.deleted,
        'is-selectable': selectionOptions?.selectable,
        'is-selected': isSelectedRow(row),
      }"
    >
      <slot>
        <slot
          name="row-inside"
          mode="grid"
        />

        <TableCellMobile
          v-for="(col, idx) in dataColumns"
          :key="col.field"
          :column="col"
          :row="row"
          :editable="isEditable"
          :column-index="idx"
        >
          <slot :name="col.name" />
        </TableCellMobile>
      </slot>
    </div>

    <!-- Used for absolutely position info/element -->
    <slot name="inner" />
  </Component>
</template>

<style lang="scss" scoped>
.tr__mobile {
  --apply: relative grid p-y-3 p-l-1 p-r-2 rounded-custom overflow-auto
  border-1 border-ca gap-x-3 hover:shadow-ca shadow-sm w-full dark:bg-darker bg-white;

  &-container {
    --apply: relative w-full block p-x-2 p-y-1;
  }

  grid-template-columns: 1fr 2fr;
  grid-template-rows: repeat(auto-fit, var(--mobileRowHeight));

  &.is-deleted {
    --apply: line-through color-ca;
  }

  &.is-selectable {
    --apply: cursor-pointer border-2;
  }

  &.is-selected {
    --apply: dark:bg-blue-900/30 bg-blue-100/30 border-primary dark:border-blue-600 border-2;
  }
}

.tr__mobile:hover {
  --apply: bg-blue-500/10;
}
</style>
