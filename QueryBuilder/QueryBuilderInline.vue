<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { IQueryBuilderProps } from '~/components/QueryBuilder/types/query-builder-props.type'
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'

// Models
import type { ComparatorEnum } from '~/libs/App/enums/comparator.enum'

// Functions
import { useQueryBuilderColumnFilters } from '~/components/QueryBuilder/functions/useQueryBuilderColumnFilters'

// Store
import { useQueryBuilderStore } from '~/components/QueryBuilder/query-builder.store'
import { queryBuilderIdKey } from '~/components/QueryBuilder/provide/query-builder.provide'

const props = withDefaults(defineProps<IQueryBuilderProps & {
  /**
   * When true, the `QueryBuilderInlineItem` will not use overlay
   * for the edit menu
   */
  noItemOverlay?: boolean
}>(), {
  maxLevel: Number.POSITIVE_INFINITY,
})

const uuid = injectLocal(queryBuilderIdKey, useId())

provideLocal(queryBuilderIdKey, uuid)

// Store
const {
  queryBuilderEl,
  columns: storeColumns,
  items: storeItems,
  maxNestingLevel: storeMaxNestingLevel,
} = storeToRefs(useQueryBuilderStore())

// Layout
const items = defineModel<IQueryBuilderProps['items']>('items', { required: true })
const level = 0
const noItemOverlay = toRef(props, 'noItemOverlay')

provide('noItemOverlay', noItemOverlay)

const noChildren = computed(() => {
  return !(items.value[0] as IQueryBuilderGroup)?.children.length
})

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

function handleAddFirstCondition() {
  const firstGroup = items.value[0] as IQueryBuilderGroup

  const path = `${firstGroup.path}.children.0`
  const firstColumn = toValue(columns)[0]

  firstGroup.children = [
    {
      id: generateUUID(),
      field: firstColumn?.field as string,
      filterField: firstColumn?.filterField as string,
      comparator: firstColumn?.comparator as ComparatorEnum,
      value: undefined as unknown as string,
      path,
    },
  ]

  nextTick(() => {
    const addedEl = unrefElement(queryBuilderEl)?.querySelector(
      `[data-path="${path}"]`,
    ) as HTMLElement

    setTimeout(() => {
      addedEl?.click()
    }, 150)
  })
}

// Column filters
const { qbColumnFilters, removeItem } = useQueryBuilderColumnFilters(props)

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

defineExpose({
  clearFilter,
})
</script>

<template>
  <div
    ref="queryBuilderEl"
    class="query-builder-inline"
  >
    <!-- Column filters -->
    <template
      v-if="
        config.table.queryBuilder.showColumnFilters && qbColumnFilters?.length
      "
    >
      <QueryBuilderRowInline
        v-for="item in qbColumnFilters"
        :key="item.path"
        :item="item"
        :level="level"
        no-add
        no-condition-change
        :editable="editable"
        :remove-fnc="removeItem"
      />

      <Separator
        v-if="items.length"
        vertical
        m="r-2 l-1"
        border="!dark:white !primary !r-2px"
      />
    </template>

    <QueryBuilderRowInline
      v-for="item in items"
      :key="item.id"
      :item="item"
      :level="level"
      :editable="editable"
    />

    <!-- Add first condition -->
    <Btn
      v-if="noChildren && editable"
      size="xs"
      preset="ADD"
      m="l-2"
      color="dark:white"
      border="2 primary"
      :label="$t('queryBuilder.addFirstCondition')"
      @click="handleAddFirstCondition"
    />
  </div>
</template>

<style scoped lang="scss">
.query-builder-inline {
  @apply flex items-center flex-wrap gap-y-0.5 gap-x-1 p-y-1;
}
</style>
