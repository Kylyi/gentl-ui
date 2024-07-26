<script setup lang="ts">
// Types
import type {
  IQueryBuilderItem,
  IQueryBuilderItemProps,
} from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Models
import type { ComparatorEnum } from '~/libs/App/enums/comparator.enum'

// Functions
import { getInputByDataType } from '~/components/Inputs/DynamicInput/constants/input-by-datatype.map'
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Injections
import {
  qbColumnsKey,
  qbHoveredItemKey,
  qbIsSmallerScreenKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

// Constants
import {
  BOOLEANISH_COMPARATORS,
  NON_VALUE_COMPARATORS,
} from '~/components/Table/constants/comparator-categories.const'

// Components
import Selector from '~/components/Selector/Selector.vue'

const props = defineProps<IQueryBuilderItemProps>()
const emits = defineEmits<{
  (e: 'delete:row', item: IQueryBuilderItem): void
  (e: 'update:comparator', comparator: ComparatorEnum): void
}>()

defineExpose({
  focusInput: (input: 'field' | 'comparator' | 'value' = 'value') => {
    switch (input) {
      case 'field':
        fieldInputEl.value?.focus?.()
        break

      case 'comparator':
        comparatorInputEl.value?.focus?.()
        break

      case 'value':
        valueInputEl.value?.focus?.()
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
const {
  isSelectorComparator,
  canUseSelectorComparator,
  isDateAgoComparator,
  getAvailableComparators,
  isEmptyComparator,
} = useTableUtils()
const { getCustomFilter } = useTableSpecifics()

// Layout
const fieldInputEl = ref<InstanceType<typeof Selector>>()
const comparatorInputEl = ref<InstanceType<typeof Selector>>()
const valueInputEl = ref<InstanceType<typeof Selector>>()
const item = toRef(props, 'item')

const cols = computed(() => toValue(columns))
const colSelected = computed(() => {
  return cols.value.find(col => col.field === item.value.field)
})

const isBooleanishComparator = computedEager(() => {
  return BOOLEANISH_COMPARATORS.includes(item.value.comparator)
})

const isNonValueComparator = computedEager(() => {
  return NON_VALUE_COMPARATORS.includes(item.value.comparator)
})

const component = computed(() => {
  return getInputByDataType(colSelected.value?.dataType || 'string')
})

/**
 * When using `TableColumn.filterComponent`, we might need to format the value
 * by its `valueFormatter`
 */
const customValue = computed({
  get() {
    if (customFilterComponent.value?.valueFormatter) {
      return customFilterComponent.value.valueFormatter.getter(item.value.value)
    }

    return item.value.value
  },
  set(value) {
    const val = typeof value === 'string' ? value.trim() : value

    if (customFilterComponent.value?.valueFormatter) {
      item.value.value = customFilterComponent.value.valueFormatter.setter(val)

      return
    }

    item.value.value = val
  },
})

/**
 * Format value for simple `ComparatorEnum.IN` and `ComparatorEnum.NOT_IN`
 */
const inValueSimple = computed({
  get() {
    return item.value.value?.join(',')
  },
  set(value: string) {
    if (value === '') {
      item.value.value = undefined

      return
    }

    const cleanedInput = value.replace(/,\s*$/, '').trim()

    item.value.value = cleanedInput.split(',').map(s => s.trim())
  },
})

const comparators = computed(() => {
  if (!colSelected.value) {
    return []
  }

  return getAvailableComparators(colSelected.value.dataType, {
    includeSelectorComparators: !!colSelected.value.getDistinctData,
    allowedComparators: colSelected.value.comparators,
    extraComparators: [
      ...(colSelected.value.extraComparators ?? []),
      ...(customFilterComponent.value?.comparators ?? []),
    ],
  }).map(comparator => ({
    id: comparator,
    label: $t(`comparator.${comparator.replaceAll('.', '|')}`),
  }))
})

const customFilterComponent = computed(() => {
  if (!colSelected.value) {
    return
  }

  const isCustomFilterComponent
    = colSelected.value.filterComponent?.comparators.includes(
      item.value.comparator,
    )

  return isCustomFilterComponent
    ? colSelected.value.filterComponent
    : getCustomFilter(colSelected.value, item.value)
})

function handleRemoveCondition() {
  if (props.removeFnc) {
    props.removeFnc(item.value)

    return
  }

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

  // NOTE: When datatype changes OR we're using non-primitive comparators, we reset value
  const isNonPrimitiveComparator
    = customFilterComponent.value?.comparators.includes(item.value.comparator)
    || canUseSelectorComparator(item.value.comparator, colSelected.value || col)

  if (
    col.dataType !== colSelected.value?.dataType
    || isNonPrimitiveComparator
  ) {
    item.value.value = undefined
  }

  item.value.field = field
  item.value.comparator = col.comparator
  item.value.filterField = col.filterField
}

function handleComparatorChange(comparator: ComparatorEnum) {
  // If the comparator was a selector comparator and now it's not, reset the value
  // If the comparator was not a selector comparator and now it is, reset the value
  const wasSelectComparator = isSelectorComparator(item.value.comparator)
  const isSelectComparator = isSelectorComparator(comparator)

  // Same for empty comparator
  const wasEmptyComparator = isEmptyComparator(item.value.comparator)
  const _isEmptyComparator = isEmptyComparator(comparator)

  if (wasSelectComparator && !isSelectComparator) {
    item.value.value = undefined
  }

  if (!wasSelectComparator && isSelectComparator) {
    item.value.value = []
  }

  if (wasEmptyComparator && !_isEmptyComparator) {
    item.value.value = undefined
  }

  if (!wasEmptyComparator && _isEmptyComparator) {
    item.value.value = undefined
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
  emits('update:comparator', comparator)

  // Focus value input
  nextTick(() => {
    valueInputEl.value?.focus?.()
  })
}

function handleValueChange(value: any) {
  if (typeof value === 'string') {
    item.value.value = value.trim()
  } else {
    item.value.value = value
  }
}

// Validation
const $z = useZod(
  {
    item: z.object({
      field: z.string(),
      comparator: z.string(),
      value: z.unknown().refine(val => {
        if (isNonValueComparator.value) {
          return isNil(val)
        }

        return !isNil(val)
      }),
    }),
  },
  { item },
  { scope: 'qb' },
)
</script>

<template>
  <li
    class="qb-row qb-item"
    :class="{
      'is-hovered': hoveredRow === item,
      'is-last-child': isLastChild,
      'no-drag': noDraggable || item.isNotDraggable,
      'no-dragover': item.isNotDragOverable,
      'is-smaller-screen': isSmallerScreen,
    }"
    :data-path="item.path"
    data-cy="qb-row"
    @mouseover.stop="hoveredRow = item"
    @mouseleave="hoveredRow = undefined"
  >
    <!-- Move handler -->
    <QueryBuilderMoveHandler
      v-if="!noDraggable && !item.isNotDraggable && editable"
      self-start
      m="t-2.5"
    />

    <div class="qb-item__content">
      <!-- Field selector -->
      <Selector
        ref="fieldInputEl"
        :model-value="item.field"
        :options="cols"
        emit-key
        size="sm"
        option-key="field"
        preselect-first
        :readonly="!editable"
        class="qb-item__content-field"
        :validation="$z.item.field"
        data-cy="qb-item__content-field"
        @update:model-value="handleFieldChange"
      >
        <template #item="{ item: col }">
          <QueryBuilderItemDataTypeShortcut
            :data-type="col.dataType"
            class="relative top-1"
            self-start
            shrink-0
            m="t-1.5"
          />

          <span p="y-1.5">
            {{ col.label }}
          </span>
        </template>

        <template
          v-if="colSelected"
          #prepend
        >
          <div
            flex="~ center"
            m="l-1"
          >
            <QueryBuilderItemDataTypeShortcut
              :data-type="colSelected.dataType"
            />
          </div>
        </template>
      </Selector>

      <template v-if="item.field && colSelected">
        <!-- Comparator selector -->
        <Selector
          ref="comparatorInputEl"
          :model-value="item.comparator"
          :options="comparators"
          emit-key
          size="sm"
          :readonly="!editable"
          class="qb-item__content-comparator"
          :validation="$z.item.comparator"
          data-cy="comparator"
          @update:model-value="handleComparatorChange"
        />

        <div
          :key="colSelected.field"
          flex="~"
        >
          <!-- Custom component -->
          <Component
            :is="customFilterComponent.component"
            v-if="customFilterComponent?.comparators.includes(item.comparator)"
            ref="valueInputEl"
            v-model="customValue"
            :readonly="!editable"
            v-bind="
              typeof customFilterComponent.props === 'function'
                ? customFilterComponent.props(customValue, item)
                : customFilterComponent.props
            "
            size="sm"
            class="qb-item__content-value"
            :placeholder="`${$t('table.filterValue')}...`"
            data-cy="qb-item__content-value"
            :validation="$z.item.value"
          />

          <!-- Selector for `Comparator.IN` and `Comparator.NOT_IN` for simple string cases -->
          <TextInput
            v-else-if="canUseSelectorComparator(item.comparator, colSelected)
              && !colSelected?.getDistinctData"
            ref="valueInputEl"
            v-model="inValueSimple"
            size="sm"
            :placeholder="`${$t('table.filterValue')}...`"
            empty-value=""
            :readonly="!editable"
            :validation="$z.item.value"
            data-cy="qb-item__content-value"
          />

          <!-- Selector of distinct values -->
          <Selector
            v-else-if="canUseSelectorComparator(item.comparator, colSelected)"
            ref="valueInputEl"
            v-model="item.value"
            :load-data="{
              fnc: () => colSelected?.getDistinctData?.(colSelected),
              mapKey: 'doesnt-really-matter',
              local: true,
              immediate: true,
            }"
            :readonly="!editable"
            :multi="isSelectorComparator(item.comparator)"
            emit-key
            class="qb-item__content-value"
            size="sm"
            :placeholder="`${$t('table.filterValue')}...`"
            data-cy="qb-item__content-value"
            :validation="$z.item.value"
          />

          <!-- Ago value -->
          <QueryBuilderTimeAgoInput
            v-else-if="isDateAgoComparator(item.comparator)"
            ref="valueInputEl"
            v-model:item="item"
            :readonly="!editable"
            :validation="$z.item.value"
          />

          <!-- $Empty/Boolean value -->
          <QueryBuilderBooleanInput
            v-else-if="isBooleanishComparator"
            :item="item"
            no-delete
            :readonly="!editable"
            @remove:item="handleRemoveCondition"
          />

          <!-- Primitive value -->
          <Component
            :is="component.component"
            v-else-if="component?.component && !isNonValueComparator"
            ref="valueInputEl"
            :model-value="item.value"
            size="sm"
            :class="{
              'qb-item__content-value': colSelected.dataType !== 'boolean',
            }"
            :readonly="!editable"
            v-bind="component.props"
            :placeholder="$t('queryBuilder.value')"
            :validation="$z.item.value"
            data-cy="qb-item__content-value"
            @update:model-value="handleValueChange"
          />
        </div>
      </template>
    </div>

    <Btn
      v-if="!noRemove && editable"
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
  @apply relative flex gap-2 rounded-custom p-l-2 min-h-10 m-r-2 m-l-5
    items-center bg-ca border-1 border-transparent;

  transition:
    background-color 0.3s ease-in-out,
    shadow 0.3s ease-in-out;

  &.is-hovered {
    @apply bg-white dark:bg-darker z-1 shadow-consistent shadow-ca;
  }

  &.is-smaller-screen .qb-item__content {
    @apply flex-col;
  }

  &:not(.is-smaller-screen) .qb-item__content {
    &-field {
      @apply w-60 shrink-0;
    }

    &-comparator {
      @apply w-55 shrink-0;
    }

    &-value {
      @apply min-w-60;
    }
  }

  &__content {
    @apply flex gap-1 grow p-y-1;

    &-field,
    &-comparator {
      @apply max-w-80;
    }
  }

  &.is-smaller-screen {
    .qb-item__content-value {
      @apply min-w-80;
    }
  }
}

.qb-item:not(.no-drag) {
  &::before {
    @apply absolute content-empty -left-3 top-0 h-full;
    @apply border-l-1 border-dark dark:border-ca border-dashed;
  }

  &::after {
    @apply absolute content-empty -left-3 w-3;
    @apply border-b-1 border-dark dark:border-ca border-dashed;

    // This is kinda specificut it shouldn't really cause issues if we
    // don't mess with int sizes
    @apply top-19.5px;
  }
}

.qb-item.is-last-child::before {
  @apply h-19.5px;
}
</style>
