<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { IQueryBuilderProps } from '~/components/QueryBuilder/types/query-builder-props.type'

// Functions
import { useQueryBuilderDragAndDrop } from '~/components/QueryBuilder/functions/useQueryBuilderDragAndDrop'
import { useQueryBuilderColumnFilters } from '~/components/QueryBuilder/functions/useQueryBuilderColumnFilters'

// Store
import { useQueryBuilderStore } from '~/components/QueryBuilder/query-builder.store'
import { queryBuilderIdKey } from '~/components/QueryBuilder/provide/query-builder.provide'

const props = withDefaults(defineProps<IQueryBuilderProps>(), {
  maxLevel: Number.POSITIVE_INFINITY,
})

const uuid = injectLocal(queryBuilderIdKey, useId())

provideLocal(queryBuilderIdKey, uuid)

// Store
const {
  columns: storeColumns,
  items: storeItems,
  maxNestingLevel: storeMaxNestingLevel,
  queryBuilderEl,
  draggedItem,
  isSmallerScreen,
} = storeToRefs(useQueryBuilderStore())

// Utils
useQueryBuilderDragAndDrop()

// Layout
const items = defineModel<IQueryBuilderProps['items']>('items', { required: true })
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

// Column filters
const { qbColumnFilters, syncFilters, removeItem } = useQueryBuilderColumnFilters(props)

// Init

const columns = toRef(props, 'columns')
const maxNestingLevel = toRef(props, 'maxLevel')

syncRef(columns, storeColumns, { direction: 'ltr' })
syncRef(items, storeItems, { direction: 'both' })
syncRef(maxNestingLevel, storeMaxNestingLevel, { direction: 'ltr' })

// Lifecycle
// When no items are provided, initialize the items with a group
if (!props.items.length && !props.noInitialization) {
  initializeItems()
}

defineExpose({ clearFilter, syncFilters })
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
        :item
        :level
        :editable
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
      :item
      :level
      :editable
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
        class="drop-indicator__icon"
        :class="{
          'rotate-y-180 -top-3': draggedItem.dropDirection === 'below',
          'rotate-180 -top-7px': draggedItem.dropDirection === 'above',
        }"
      >
        <div i-tabler:arrow-back />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.query-builder {
  @apply relative bg-ca p-1 p-b-3 rounded-custom overflow-auto;
}

.drop-indicator {
  @apply absolute h-2px bg-primary w-full rounded-full pointer-events-none z-$zMax;

  &__icon {
    @apply w-5 h-5 relative -left-5 rounded-custom
    color-primary bg-white dark:bg-darker;
  }
}
</style>
