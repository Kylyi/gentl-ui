<script setup lang="ts">
// Types
import {
  IQueryBuilderItem,
  IQueryBuilderItemProps,
} from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Injections
import {
  qbColumnsKey,
  qbHoveredItemKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

const props = defineProps<IQueryBuilderItemProps>()
const emits = defineEmits<{
  (e: 'delete:row', item: IQueryBuilderItem): void
}>()

// Injections
const columns = injectStrict(qbColumnsKey)
const items = injectStrict(qbItemsKey)
const hoveredRow = injectStrict(qbHoveredItemKey)

// Layout
const item = toRef(props, 'item')

const cols = computed(() => toValue(columns))
const colSelected = computed(() => {
  return cols.value.find(col => col.field === item.value.field)
})

const component = computed(() => {
  return COMPONENTS_BY_DATATYPE_MAP[colSelected.value?.dataType]
})

const comparators = computed(() => {
  return CONDITIONS_BY_DATATYPE_MAP[colSelected.value?.dataType]
})

function handleRemoveCondition() {
  const idx = item.value.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  parent.children = [...parent.children]

  emits('delete:row', item.value)
}

function handleFieldChange(field: string) {
  const col = cols.value.find(col => col.field === field)

  if (!col) {
    return
  }

  item.value.comparator = col.comparator
  item.value.value = col.dataType === 'boolean' ? true : undefined
}
</script>

<template>
  <li
    class="qb-row qb-item"
    :class="{
      'is-hovered': hoveredRow === item,
      'is-last-child': isLastChild,
      'no-draggable': noDraggable,
    }"
    @mouseover.stop="hoveredRow = item"
    @mouseleave="hoveredRow = undefined"
  >
    <!-- Move handler -->
    <QueryBuilderMoveHandler
      v-if="!noDraggable"
      self-start
      m="t-2.5"
    />

    <div
      flex="~ col lg:row gap-1"
      grow
      p="y-1"
    >
      <!-- Field selector -->
      <Selector
        v-model="item.field"
        :options="cols"
        emit-key
        size="sm"
        option-key="field"
        preselect-first
        w="lg:60"
        @update:model-value="handleFieldChange"
      />

      <template v-if="item.field && colSelected">
        <!-- Comparator selector -->
        <Selector
          v-if="colSelected.dataType !== 'boolean'"
          v-model="item.comparator"
          :options="colSelected.comparators || comparators"
          emit-key
          size="sm"
          w="lg:40"
          :option-label="condition => $t(`comparator.${condition.id}`)"
          no-search
        />

        <!-- Value -->
        <Component
          :is="component.component"
          v-model="item.value"
          size="sm"
          w="lg:70"
          v-bind="component.props"
          :placeholder="$t('queryBuilder.value')"
        />
      </template>
    </div>

    <Btn
      size="xs"
      preset="TRASH"
      m="r-2"
      self="start lg:center"
      @click="handleRemoveCondition"
    />
  </li>
</template>

<style scoped lang="scss">
.qb-item {
  --apply: relative flex gap-2 flex-wrap rounded-custom p-l-2 min-h-10 m-r-2 m-l-5
    items-center bg-ca border-1 border-transparent;

  &.is-hovered {
    --apply: bg-white dark:bg-darker;
  }
}

.qb-item:not(.no-draggable) {
  &::before {
    --apply: absolute content-empty -left-3 top-0 h-full
      border-l-1 border-ca border-dashed;
  }

  &::after {
    --apply: absolute content-empty -left-3 w-3
      border-b-1 border-ca border-dashed;

      // This is kinda specific but it shouldn't really cause issues if we
      // don't mess with input sizes
    --apply: top-19.5px;
  }
}

.qb-item.is-last-child::before {
  --apply: h-19.5px;
}
</style>
