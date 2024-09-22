<script setup lang="ts">
// Types
import type { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  column: TableColumn
  columns: TableColumn<any>[]
  last?: boolean
  smallScreen?: boolean
  noLock?: boolean
}

const props = defineProps<IProps>()

// Layout
const hasFrozenBtn = computed(() => {
  const col = props.column

  return (
    !col.isHelperCol && !col.noFreeze && !props.smallScreen && !props.noLock
  )
})
</script>

<template>
  <div
    class="th"
    :class="[
      column.headerClasses,
      `column-${column.name}`,
      {
        'has-data': !column.isHelperCol,
        'is-frozen': column.frozen,
        'is-semi-frozen': column.semiFrozen,
        'is-last': !!last,
        'is-small-screen': smallScreen,
        'is-filtered': column.filterDbQuery,
        'is-sorted': column.sort,
      },
    ]"
    :style="{ ...column.headerStyle, [`--colWidth`]: column.adjustedWidthPx }"
  >
    <slot :column="column">
      <span
        v-if="column._label"
        :title="column._label"
        class="th-label"
        data-cy="table-header-item"
      >
        {{ column._label }}
      </span>

      <div v-if="column.name === '_selectable'">
        <slot name="selection" />
      </div>

      <div
        flex="~ items-center"
        relative
      >
        <!-- Lock -->
        <TableColumnFreezeBtn
          v-if="hasFrozenBtn"
          :column="column"
          :columns="columns"
          position="!absolute"
          :class="[
            !(column.noFilterSort || column.isHelperCol)
              ? 'left--7'
              : 'left--9',
          ]"
          backdrop-blur="sm"
        />

        <!-- Filter -->
        <TableColumnFilterBtn
          v-if="!(column.noFilterSort || column.isHelperCol)"
          :column="column"
          :columns="columns"
          m="x-1"
          shrink-0
        />
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.th {
  @apply flex shrink-0 items-center font-semibold text-xs tracking-wide
    border-ca border-b-1 border-t-1;

  &.has-data {
    @apply border-l-1;
  }

  &.is-last {
    @apply border-r-1;
  }

  &-label {
    @apply grow p-l-2 p-r-1 line-clamp-2;

    &::after {
      content: '\00a0';
    }
  }

  &:not(.is-small-screen) {
    @apply w-$colWidth;
  }

  &.is-small-screen {
    @apply rounded-custom border-1 max-w-40;

    &.is-filtered {
      @apply border-t-1 border-l-1 border-t-primary border-l-primary;
    }

    &.is-sorted {
      @apply border-b-1 border-r-1 border-b-secondary border-r-secondary;
    }
  }

  &.is-semi-frozen {
    @apply z-6;

    &::after {
      @apply content-empty absolute -right-px top-0 h-full w-px bg-primary;
    }
  }
}

.column-lock {
  @apply hidden;
}

.th:hover .column-lock,
.th.is-frozen .column-lock {
  @apply flex;
}
</style>
