<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  row: any
  columns: TableColumn<any>[]
  index: number
  rowHeight: number
}

withDefaults(defineProps<IProps>(), {
  index: 0,
})
</script>

<template>
  <div
    class="tr__mobile-container"
    :style="{ minHeight: `${rowHeight}px` }"
  >
    <slot>
      <div
        class="tr__mobile"
        :class="{ 'is-deleted': row.deleted }"
      >
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
                    <span class="p-x-2 truncate">
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
  </div>
</template>

<style lang="scss" scoped>
.tr__mobile {
  --apply: grid p-3 rounded-custom overflow-auto hover:bg-primary/10 hover:dark:bg-primary/10
  border-1 border-ca gap-x-3 hover:shadow-ca shadow-sm w-full dark:bg-darker bg-white;

  &-container {
    --apply: relative p-x-2 p-y-1;
  }

  grid-template-columns: 1fr 2fr;
  grid-template-rows: repeat(auto-fit, var(--mobileRowHeight));

  &.is-deleted {
    --apply: line-through color-ca;
  }
}

.cell {
  --apply: flex items-center leading-tight h-$mobileRowHeight truncate;

  &-label {
    --apply: font-rem-14 font-bold;
  }
}
</style>
