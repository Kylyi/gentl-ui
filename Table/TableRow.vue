<script setup lang="ts">
// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  columns: TableColumn<any>[]
  index?: number
  row: any
  rowHeight: number
}

withDefaults(defineProps<IProps>(), {
  index: 0,
})

// Injections
const selectRow = injectStrict(tableSelectRowKey)
const isSelectedRow = injectStrict(tableIsSelectedRowKey)
</script>

<template>
  <div
    flex="~"
    class="tr"
    :style="{ minHeight: `${rowHeight}px` }"
    :class="{ 'is-odd': index % 2, 'is-deleted': row.deleted }"
  >
    <slot>
      <slot name="row-inside" />

      <template
        v-for="(col, idx) in columns"
        :key="idx"
      >
        <div
          v-if="!col.hidden"
          class="cell"
          :class="[
            `col-${col.name}`,
            col.classes,
            {
              'has-data': !col.isHelperCol,
              'is-frozen': col.frozen,
              'is-semi-frozen': col.semiFrozen,
            },
          ]"
          :style="{ ...col.style, width: col.adjustedWidthPx }"
        >
          <div
            v-if="col.field === '_selectable'"
            flex="~ center"
            w="full"
            @click.stop.prevent
          >
            <Checkbox
              :model-value="isSelectedRow(row)"
              @update:model-value="selectRow(row)"
            />
          </div>

          <ValueFormatter
            v-else
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
                <span
                  v-if="col.dataType !== 'boolean'"
                  class="p-x-2 truncate"
                >
                  {{ val }}
                </span>

                <Checkbox
                  v-else
                  :model-value="get(row, col.field)"
                  :editable="false"
                  :label="val"
                  m="x-2"
                />
              </slot>
            </template>
          </ValueFormatter>
        </div>
      </template>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.tr {
  --apply: relative;

  &.is-deleted {
    --apply: line-through color-ca;
  }

  &.is-odd {
    .cell {
      --apply: bg-white dark:bg-darker;
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
</style>
