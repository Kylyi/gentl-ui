<script setup lang="ts">
import { NuxtLink } from '#components'

// Models
import { type ITableProps } from '~/components/Table/types/table-props.type'

type IProps = Pick<ITableProps, 'columns' | 'rowHeight' | 'to'> & {
  index?: number
  row: any
}

withDefaults(defineProps<IProps>(), {
  index: 0,
})
</script>

<template>
  <Component
    :is="to?.(row) ? NuxtLink : 'div'"
    flex="~"
    class="tr"
    :style="{ minHeight: `${rowHeight}px` }"
    :class="{ 'is-odd': index % 2, 'is-deleted': row.deleted }"
    :to="to ? to(row) : undefined"
  >
    <slot>
      <slot name="row-inside" />

      <template
        v-for="(col, idx) in columns"
        :key="idx"
      >
        <TableCell
          v-if="!col.hidden"
          :col="col"
          :row="row"
        >
          <slot :name="col.name" />
        </TableCell>
      </template>
    </slot>
  </Component>
</template>

<style lang="scss" scoped>
.tr {
  --apply: relative;

  &.is-deleted {
    --apply: line-through color-ca;
  }

  &.is-odd {
    .cell {
      --apply: bg-$Table-alternate-row-bg;
    }
  }
}

.cell {
  --apply: min-h-inherit flex shrink-0 items-center border-b-1 border-ca;

  &.has-data {
    --apply: border-l-1;
  }

  &:last-of-type {
    --apply: border-r-1;
  }

  &.is-frozen {
    --apply: dark:shadow-black/30 shadow-black/10;
    box-shadow: 8px 0 24px -2px var(--un-shadow-color);
  }
}

.tr:hover {
  .cell {
    --apply: bg-blue-500/10;
  }
}
</style>
