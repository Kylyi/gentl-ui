<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  row: any
  rowHeight: number
  columns: TableColumn<any>[]
}

defineProps<IProps>()
</script>

<template>
  <div
    flex="~"
    class="tr"
    :class="{ 'is-deleted': row.deleted }"
    :style="{ minHeight: `${rowHeight}px` }"
  >
    <slot>
      <div
        v-for="(col, idx) in columns"
        :key="idx"
        class="cell"
        :class="[`col-${col.name}`, { 'has-data': !col.isHelperCol }]"
        :style="{ width: col.adjustedWidthPx }"
      >
        <ValueFormatter
          :value="get(row, col.field)"
          :data-type="col.dataType"
          :format="col.format"
          :row="row"
        >
          <template #default="{ val }">
            <slot
              :name="col.name"
              :value="val"
            >
              <span class="p-x-2 truncate">
                {{ val }}
              </span>
            </slot>
          </template>
        </ValueFormatter>
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.tr {
  &.is-deleted {
    --apply: line-through color-ca;
  }
}

.cell {
  --apply: min-h-inherit flex shrink-0 items-center border-b-1 border-ca
    overflow-auto;

  &.has-data {
    --apply: border-l-1;
  }

  &:last-of-type {
    --apply: border-r-1;
  }
}
</style>
