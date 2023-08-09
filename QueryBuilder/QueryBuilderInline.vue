<script setup lang="ts">
// Types
import type { IQueryBuilderProps } from '~/components/QueryBuilder/types/query-builder-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import {
  qbCollapsedKey,
  qbColumnsKey,
  qbContainerKey,
  qbDraggedItemKey,
  qbHoveredItemKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

const props = defineProps<IQueryBuilderProps>()

// Layout
const queryBuilderEl = ref<HTMLDivElement>()
const items = toRef(props, 'items')
const level = 0

// Provide
const columns = toRef(props, 'columns')
const hoveredRow = ref<IQueryBuilderRow>()

provide(qbColumnsKey, columns)
provide(qbItemsKey, items)
provide(qbHoveredItemKey, hoveredRow)
provide(qbContainerKey, queryBuilderEl)
provide(qbDraggedItemKey, ref(undefined))
provide(qbCollapsedKey, ref<Record<string, boolean>>({}))
</script>

<template>
  <div
    ref="queryBuilderEl"
    class="query-builder-inline"
  >
    <QueryBuilderRowInline
      v-for="(item, idx) in items"
      :key="item.id"
      :item="item"
      :level="level"
      :index="idx"
      inline
    />
  </div>
</template>

<style scoped lang="scss">
.query-builder-inline {
  --apply: flex items-center flex-wrap;
}
</style>
