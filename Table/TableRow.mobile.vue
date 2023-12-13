<script setup lang="ts">
import { NuxtLink } from '#components'

// Types
import { type ITableProps } from '~/components/Table/types/table-props.type'

// Injections
import {
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'

type IProps = Pick<
  ITableProps,
  'columns' | 'rowHeight' | 'to' | 'selectable'
> & {
  index?: number
  row: any
}

withDefaults(defineProps<IProps>(), {
  index: 0,
})

// Injections
const selectRow = injectStrict(tableSelectRowKey, () => {})
const isSelectedRow = injectStrict(tableIsSelectedRowKey, () => false)
</script>

<template>
  <Component
    :is="to?.(row) ? NuxtLink : 'div'"
    class="tr__mobile-container"
    :style="{ minHeight: `${rowHeight}px` }"
    :to="to?.(row)"
  >
    <slot>
      <div
        class="tr__mobile"
        :class="{
          'is-deleted': row.deleted,
          'is-selectable': selectable,
          'is-selected': isSelectedRow(row),
        }"
        @click="selectable && selectRow(row)"
      >
        <slot name="row-inside" />

        <template
          v-for="(col, idx) in columns"
          :key="idx"
        >
          <template v-if="!col.isHelperCol && !col.hidden">
            <div
              v-if="!col.hideLabel"
              class="cell cell-label"
            >
              <span truncate>
                {{ col._label }}
              </span>
            </div>

            <div
              class="cell cell-value"
              :class="{ 'col-span-2': col.hideLabel }"
            >
              <ValueFormatter
                :value="get(row, col.field)"
                :data-type="col.dataType"
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
        </template>
      </div>
    </slot>

    <!-- Used for absolutely position info/element -->
    <slot name="inner" />
  </Component>
</template>

<style lang="scss" scoped>
.tr__mobile {
  --apply: relative grid p-3 rounded-custom overflow-auto
  border-1 border-ca gap-x-3 hover:shadow-ca shadow-sm w-full dark:bg-darker bg-white;

  &-container {
    --apply: relative block p-x-2 p-y-1;
  }

  grid-template-columns: 1fr 2fr;
  grid-template-rows: repeat(auto-fit, var(--mobileRowHeight));

  &.is-deleted {
    --apply: line-through color-ca;
  }

  &.is-selectable {
    --apply: cursor-pointer;
  }

  &.is-selected {
    --apply: dark:bg-blue-900/10 bg-blue-100/10 border-primary;
  }
}

.cell {
  --apply: flex items-center leading-tight h-$mobileRowHeight truncate;

  &-label {
    --apply: font-rem-14 font-bold;
  }
}
</style>
