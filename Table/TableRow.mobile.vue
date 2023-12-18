<script setup lang="ts">
import { NuxtLink } from '#components'

// Types
import { type ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

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

const props = withDefaults(defineProps<IProps>(), {
  index: 0,
})

// Injections
const selectRow = injectStrict(tableSelectRowKey, () => {})
const isSelectedRow = injectStrict(tableIsSelectedRowKey, () => false)

// Layout
const row = toRef(props, 'row')
const isEditing = ref(false)

function handleSetModelValue(value: any, col: TableColumn) {
  set(row.value, col.field, value)
}
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
        class="tr tr__mobile"
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
              @click.stop.prevent="isEditing = true"
            >
              <Component
                :is="col._editComponent.component"
                v-if="isEditing"
                :model-value="get(row, col.field)"
                v-bind="col._editComponent.props"
                @update:model-value="handleSetModelValue"
              />

              <ValueFormatter
                v-else
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
    --apply: dark:bg-blue-900/30 bg-blue-100/30 border-blue-400 border-2 color-blue-400;
  }
}

.cell {
  --apply: flex items-center leading-tight h-$mobileRowHeight truncate;

  &-label {
    --apply: font-rem-14 font-bold;
  }
}

.tr__mobile:hover {
  --apply: bg-blue-500/10;
}
</style>
