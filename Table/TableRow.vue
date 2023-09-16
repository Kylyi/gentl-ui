<script setup lang="ts">
import { NuxtLink } from '#components'

// Models
import { ITableProps } from '~/components/Table/types/table-props.type'

// Injections
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'

type IProps = Pick<ITableProps, 'columns' | 'rowHeight' | 'to'> & {
  index?: number
  row: any
}

withDefaults(defineProps<IProps>(), {
  index: 0,
})

// Injections
const selectRow = injectStrict(tableSelectRowKey)
const isSelectedRow = injectStrict(tableIsSelectedRowKey)
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
              <slot
                :name="col.name"
                :value="val"
              >
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
</style>
