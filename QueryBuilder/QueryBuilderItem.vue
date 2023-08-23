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
  qbIsSmallerScreenKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Components
import Selector from '~/components/Selector/Selector.vue'

// Constants
import { COMPARATORS_BY_DATATYPE_MAP } from '~/libs/App/constants/input-map.constant'
import { ComparatorEnum } from 'libs/App/data/enums/comparator.enum'

const props = defineProps<IQueryBuilderItemProps>()
const emits = defineEmits<{
  (e: 'delete:row', item: IQueryBuilderItem): void
}>()

defineExpose({
  focusInput: (input: 'field' | 'comparator' | 'value' = 'value') => {
    switch (input) {
      case 'field':
        fieldInputEl.value?.focus()
        break

      case 'comparator':
        comparatorInputEl.value?.focus()
        break

      case 'value':
        valueInputEl.value?.focus()
        break
    }
  },
})

// Injections
const columns = injectStrict(qbColumnsKey)
const items = injectStrict(qbItemsKey)
const hoveredRow = injectStrict(qbHoveredItemKey)
const isSmallerScreen = injectStrict(qbIsSmallerScreenKey)

// Utils
const { isSelectorComparator, isDateAgoComparator } = useTableUtils()

// Layout
const fieldInputEl = ref<InstanceType<typeof Selector>>()
const comparatorInputEl = ref<InstanceType<typeof Selector>>()
const valueInputEl = ref<InstanceType<typeof Selector>>()
const item = toRef(props, 'item')

const cols = computed(() => toValue(columns))
const colSelected = computed(() => {
  return cols.value.find(col => col.field === item.value.field)
})

const component = computed(() => {
  return COMPONENTS_BY_DATATYPE_MAP[colSelected.value?.dataType]
})

const comparators = computed(() => {
  return COMPARATORS_BY_DATATYPE_MAP[colSelected.value?.dataType]
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

function handleComparatorChange(comparator: ComparatorEnum) {
  // If the comparator was a selector comparator and now it's not, reset the value
  // If the comparator was not a selector comparator and now it is, reset the value
  const wasSelectComparator = isSelectorComparator(item.value.comparator)
  const isSelectComparator = isSelectorComparator(comparator)

  if (wasSelectComparator && !isSelectComparator) {
    item.value.value = undefined
  }

  if (!wasSelectComparator && isSelectComparator) {
    item.value.value = []
  }

  // If the comparator was a date ago comparator and now it's not, reset the value
  // If the comparator was not a date ago comparator and now it is, reset the value
  const _wasDateAgoComparator = isDateAgoComparator(item.value.comparator)
  const _isDateAgoComparator = isDateAgoComparator(comparator)

  if (_wasDateAgoComparator && !_isDateAgoComparator) {
    item.value.value = undefined
  }

  if (!_wasDateAgoComparator && _isDateAgoComparator) {
    item.value.value = '1m'
  }

  item.value.comparator = comparator
}

// Validation
const $v = useVuelidate(
  {
    item: {
      field: { required },
      comparator: { required },
      value: { required },
    },
  },
  { item },
  { $scope: 'qb' }
)
</script>

<template>
  <li
    class="qb-row qb-item"
    :class="{
      'is-hovered': hoveredRow === item,
      'is-last-child': isLastChild,
      'no-draggable': noDraggable,
      'is-smaller-screen': isSmallerScreen,
    }"
    :data-path="item.path"
    @mouseover.stop="hoveredRow = item"
    @mouseleave="hoveredRow = undefined"
  >
    <!-- Move handler -->
    <QueryBuilderMoveHandler
      v-if="!noDraggable"
      self-start
      m="t-2.5"
    />

    <div class="qb-item__content">
      <!-- Field selector -->
      <Selector
        ref="fieldInputEl"
        v-model="item.field"
        :options="cols"
        emit-key
        size="sm"
        option-key="field"
        preselect-first
        class="qb-item__content-field"
        :errors="$v.item.field.$errors"
        @update:model-value="handleFieldChange"
      />

      <template v-if="item.field && colSelected">
        <!-- Comparator selector -->
        <Selector
          v-if="colSelected.dataType !== 'boolean'"
          ref="comparatorInputEl"
          :model-value="item.comparator"
          :options="colSelected.comparators || comparators"
          emit-key
          size="sm"
          class="qb-item__content-comparator"
          :option-label="comparator => $t(`comparator.${comparator.id}`)"
          no-search
          :errors="$v.item.comparator.$errors"
          @update:model-value="handleComparatorChange"
        />

        <!-- Selector values -->
        <Selector
          v-if="colSelected.getDistinctData"
          ref="valueInputEl"
          v-model="item.value"
          :load-data="{
            fnc: () => colSelected?.getDistinctData?.(colSelected),
            mapKey: 'doesnt-really-matter',
            local: true,
            immediate: true,
          }"
          :multi="isSelectorComparator(item.comparator)"
          emit-key
          option-key="_value"
          option-label="_label"
          class="qb-item__content-value"
          size="sm"
          :placeholder="`${$t('table.filterValue')}...`"
        />

        <!-- Ago value -->
        <QueryBuilderTimeAgoInput
          v-else-if="isDateAgoComparator(item.comparator)"
          :item="item"
        />

        <!-- Primitive value -->
        <Component
          :is="component.component"
          v-else
          ref="valueInputEl"
          v-model="item.value"
          size="sm"
          :class="{
            'qb-item__content-value': colSelected.dataType !== 'boolean',
          }"
          v-bind="component.props"
          :placeholder="$t('queryBuilder.value')"
          :errors="$v.item.value.$errors"
        />
      </template>
    </div>

    <Btn
      size="xs"
      preset="TRASH"
      m="t-2 r-2"
      self="start"
      tabindex="-1"
      @click="handleRemoveCondition"
    />

    <slot name="append" />
  </li>
</template>

<style scoped lang="scss">
.qb-item {
  --apply: relative flex gap-2 rounded-custom p-l-2 min-h-10 m-r-2 m-l-5
    items-center bg-ca border-1 border-transparent;

  transition:
    background-color 0.3s ease-in-out,
  shadow 0.3s ease-in-out;

  &.is-hovered {
    --apply: bg-white dark:bg-darker z-1 shadow-consistent shadow-ca;
  }

  &.is-smaller-screen .qb-item__content {
    --apply: flex-col;
  }

  &:not(.is-smaller-screen) .qb-item__content {
    &-field {
      --apply: w-60;
    }

    &-comparator {
      --apply: w-40;
    }

    &-value {
      --apply: grow;
    }
  }

  &__content {
    --apply: flex gap-1 grow p-y-1;

    &-field,
    &-comparator {
      --apply: max-w-80;
    }
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
