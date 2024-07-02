<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { IQueryBuilderProps } from '~/components/QueryBuilder/types/query-builder-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import {
  qbCollapsedKey,
  qbColumnsKey,
  qbContainerKey,
  qbHoveredItemKey,
  qbIsSmallerScreenKey,
  qbItemsKey,
  qbMaxLevelKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

// Functions
import { useQueryBuilderDragAndDrop } from '~/components/QueryBuilder/functions/useQueryBuilderDragAndDrop'
import { useQueryBuilderColumnFilters } from '~/components/QueryBuilder/functions/useQueryBuilderColumnFilters'

const props = withDefaults(defineProps<IQueryBuilderProps>(), {
  maxLevel: Number.POSITIVE_INFINITY,
})

const emits = defineEmits<{
  (e: 'update:items', items: IQueryBuilderRow[]): void
}>()

// Utils
const {
  draggedItem,
  queryBuilderEl,
  queryBuilderElRect,
} = useQueryBuilderDragAndDrop()

// Layout
const items = useVModel(props, 'items', emits)
const isSmallerScreen = ref(false)
const level = 0

function initializeItems() {
  // We don't want to trigger the reactivity here
  items.value.push({
    id: generateUUID(),
    isGroup: true,
    children: [],
    condition: 'AND',
    path: '0',
  })
}

function clearFilter() {
  items.value = [
    {
      id: generateUUID(),
      isGroup: true,
      children: [],
      condition: 'AND',
      path: '0',
    },
  ]
}

useResizeObserver(queryBuilderEl, entries => {
  const { contentRect } = entries[0]

  isSmallerScreen.value = contentRect.width < 1024
  queryBuilderElRect.value = queryBuilderEl.value?.getBoundingClientRect()
})

// Column filters
const { qbColumnFilters, syncFilters, removeItem } = useQueryBuilderColumnFilters(props)

// Provide
const columns = toRef(props, 'columns')
const hoveredRow = ref<IQueryBuilderRow>()
const collapsed = ref<Record<string, boolean>>({})

provide(qbColumnsKey, columns)
provide(qbItemsKey, items)
provide(qbHoveredItemKey, hoveredRow)
provide(qbContainerKey, queryBuilderEl)
provide(qbCollapsedKey, collapsed)
provide(qbIsSmallerScreenKey, isSmallerScreen)
provide(qbMaxLevelKey, props.maxLevel)

// Lifecycle
// When no items are provided, initialize the items with a group
if (!props.items.length && !props.noInitialization) {
  initializeItems()
}

defineExpose({
  clearFilter,
  syncFilters,
})
</script>

<template>
  <div
    ref="queryBuilderEl"
    class="query-builder"
    :class="{ 'is-collapsed': isSmallerScreen }"
  >
    <template v-if="config.table.queryBuilder.showColumnFilters && qbColumnFilters?.length">
      <!-- Column filters -->
      <div
        text="sm"
        font="bold"
        p="x-3 t-2"
      >
        {{ $t('table.columnFilters') }}
      </div>

      <QueryBuilderRow
        v-for="item in qbColumnFilters"
        :key="item.path"
        :item="item"
        :level="level"
        :editable="editable"
        no-add
        no-condition-change
        :remove-fnc="removeItem"
        p="!l-2"
        m="!l-0"
      />

      <Separator m="t-2 b-4" />
    </template>

    <QueryBuilderRow
      v-for="item in items"
      :key="item.path"
      :item="item"
      :level="level"
      :editable="editable"
      p="!l-2"
      m="!l-0"
    />

    <!-- Drop indicator -->
    <div
      v-if="draggedItem?.dropIndicatorPos"
      class="drop-indicator"
      :style="{
        left: `${draggedItem.dropIndicatorPos.x ?? 0}px`,
        top: `${draggedItem.dropIndicatorPos.y ?? 0}px`,
        width: `${draggedItem.dropIndicatorPos.width ?? 0}px`,
      }"
    >
      <div
        class="i-tabler:arrow-back drop-indicator__icon"
        :class="{
          'rotate-y-180 -top-3': draggedItem.dropDirection === 'below',
          'rotate-180 -top-7px': draggedItem.dropDirection === 'above',
        }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.query-builder {
  @apply relative bg-ca p-1 rounded-custom overflow-auto;
}

.drop-indicator {
  @apply absolute h-2px bg-primary w-full rounded-full pointer-events-none z-2;

  &__icon {
    @apply w-5 h-5 relative -left-5 color-primary;
  }
}
</style>
