<script setup lang="ts">
// Injections
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  col: TableColumn
  row: any
}

defineProps<IProps>()

// Injections
const selectRow = injectStrict(tableSelectRowKey, () => {})
const isSelectedRow = injectStrict(tableIsSelectedRowKey, () => false)
</script>

<template>
  <div
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
    <!-- Selection -->
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

    <!-- Regular field -->
    <ValueFormatter
      v-else
      :value="get(row, col.field)"
      :data-type="col.dataType"
      :format="col.format"
      :row="row"
    >
      <template #default="{ val }">
        <slot :value="val">
          <!-- Boolean -->
          <Checkbox
            v-if="col.dataType === 'boolean'"
            :model-value="get(row, col.field)"
            :editable="false"
            :label="val"
            m="x-2"
          />

          <!-- Link -->
          <NuxtLink
            v-else-if="col.link?.(row)"
            class="link"
            :to="col.link(row) || ''"
            p="x-2"
          >
            {{ val }}
          </NuxtLink>

          <span
            v-else
            class="p-x-2 truncate"
          >
            {{ val }}
          </span>
        </slot>
      </template>
    </ValueFormatter>
  </div>
</template>
