<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// INJECTION KEYS
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  columns: TableColumn<any>[]
  row: any
  rowHeight: number
}

defineProps<IProps>()

// INJECTIONS
const selectRow = injectStrict(tableSelectRowKey)
const isSelectedRow = injectStrict(tableIsSelectedRowKey)
</script>

<template>
  <div
    flex="~"
    class="tr"
    :class="{ 'is-deleted': row.deleted }"
    :style="{ minHeight: `${rowHeight}px` }"
  >
    <slot>
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
