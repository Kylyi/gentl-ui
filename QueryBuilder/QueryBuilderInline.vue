<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IQueryBuilderProps } from '~/components/QueryBuilder/types/query-builder-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// Injections
import {
  qbCollapsedKey,
  qbColumnsKey,
  qbContainerKey,
  qbDraggedItemKey,
  qbHoveredItemKey,
  qbIsSmallerScreenKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'
import { useQueryBuilderColumnFilters } from '~/components/QueryBuilder/functions/useQueryBuilderColumnFilters'

const props = defineProps<IQueryBuilderProps>()

// Layout
const queryBuilderEl = ref<HTMLDivElement>()
const items = useVModel(props, 'items')
const level = 0
const isSmallerScreen = ref(false)

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
      comparator: firstColumn?.comparator as ComparatorEnum,
      value: undefined as unknown as string,
      path,
    },
  ]

  nextTick(() => {
    const addedEl = unrefElement(queryBuilderEl)?.querySelector(
      `[data-path="${path}"]`
    ) as HTMLElement

    setTimeout(() => {
      addedEl?.click()
    }, 150)
  })
}

useResizeObserver(queryBuilderEl, entries => {
  const { contentRect } = entries[0]

  isSmallerScreen.value = contentRect.width < 1024
})

// Column filters
const { qbColumnFilters, removeItem } = useQueryBuilderColumnFilters(props)

// Provide
const columns = toRef(props, 'columns')
const hoveredRow = ref<IQueryBuilderRow>()

provide(qbColumnsKey, columns)
provide(qbItemsKey, items)
provide(qbHoveredItemKey, hoveredRow)
provide(qbContainerKey, queryBuilderEl)
provide(qbDraggedItemKey, ref(undefined))
provide(qbCollapsedKey, ref<Record<string, boolean>>({}))
provide(qbIsSmallerScreenKey, isSmallerScreen)

// Lifecycle
// When no items are provided, initialize the items with a group
if (!props.items.length) {
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
      v-if="noChildren"
      size="xs"
      preset="ADD"
      m="t-1 l-2"
      color="darker dark:white"
      border="2 primary"
      :label="$t('queryBuilder.addFirstCondition')"
      @click="handleAddFirstCondition"
    />
  </div>
</template>

<style scoped lang="scss">
.query-builder-inline {
  --apply: flex items-center flex-wrap;
}
</style>
