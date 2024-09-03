<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Models
import type { ComparatorEnum } from '~/libs/App/enums/comparator.enum'
import type { FilterItem } from '~/libs/Shared/models/filter-item'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'
import { getInputByDataType } from '~/components/Inputs/DynamicInput/constants/input-by-datatype.map'

// Injections
import { tableRefreshKey } from '~/components/Table/provide/table.provide'

// Constants
import {
  BOOLEANISH_COMPARATORS,
  NON_VALUE_COMPARATORS,
} from '~/components/Table/constants/comparator-categories.const'

// Components
import type { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  column: TableColumn<any>
  filter: FilterItem<any>
  noDelete?: boolean
}

const props = defineProps<IProps>()

// Utils
const { getCustomFilter } = useTableSpecifics()
const {
  getAvailableComparators,
  isSelectorComparator,
  canUseSelectorComparator,
  isDateAgoComparator,
  isEmptyComparator,
} = useTableUtils()

// Injections
const tableRefresh = injectStrict(tableRefreshKey)

// Layout
const valueInputEl = ref<any>()
const filter = toRef(props, 'filter')
const column = toRef(props, 'column')

const isBooleanishComparator = computed(() => {
  return BOOLEANISH_COMPARATORS.includes(filter.value.comparator)
})

const isNonValueComparator = computed(() => {
  return NON_VALUE_COMPARATORS.includes(filter.value.comparator)
})

const component = computed(() => {
  return getInputByDataType(column.value.dataType)
})

const inputDebounce = computed(() => {
  switch (props.column.dataType) {
    case 'string':
    case 'number':
    case 'int':
    case 'percent':
    case 'long':
    case 'double':
      return 500

    default:
      return undefined
  }
})

/**
 * When using `TableColumn.filterComponent`, we might need to format the value
 * by its `valueFormatter`
 */
const customValueComputed = computed({
  get() {
    if (customFilterComponent.value?.valueFormatter) {
      return customFilterComponent.value.valueFormatter.getter(
        filter.value.value,
      )
    }

    return filter.value.value
  },
  set(value) {
    if (customFilterComponent.value?.valueFormatter) {
      filter.value.value
        = customFilterComponent.value.valueFormatter.setter(value)

      return
    }

    filter.value.value = value
  },
})

/**
 * Format value for simple `ComparatorEnum.IN` and `ComparatorEnum.NOT_IN`
 */
const customValue = computed({
  get() {
    return filter.value.value?.join(',')
  },
  set(value: string) {
    if (value === '') {
      filter.value.value = undefined

      return
    }

    const cleanedInput = value.replace(/,\s*$/, '').trim()

    filter.value.value = cleanedInput.split(',').map(s => s.trim())
  },
})

const comparatorOptions = computed(() => {
  return getAvailableComparators(column.value.dataType, {
    includeSelectorComparators: !!column.value.getDistinctData,
    allowedComparators: column.value.comparators,
    extraComparators: [
      ...(column.value.extraComparators ?? []),
      ...(customFilterComponent.value?.comparators ?? []),
    ],
  }).map(comparator => ({
    id: comparator,
    label: $t(`comparator.${comparator.replaceAll('.', '|')}`),
  }))
})

const customFilterComponent = computed(() => {
  const isCustomFilterComponent
    = column.value.filterComponent?.comparators.includes(filter.value.comparator)

  return isCustomFilterComponent
    ? column.value.filterComponent
    : getCustomFilter(column.value, filter.value)
})

const hiddenComparators = computed(() => {
  const availableComparators = comparatorOptions.value

  if (config.table.allowComparatorsOfSameType) {
    return {}
  }

  const columnComparators = column.value.filters.flatMap(filter => {
    const isBooleanishComparator = BOOLEANISH_COMPARATORS.includes(
      filter.comparator,
    )

    return isBooleanishComparator ? BOOLEANISH_COMPARATORS : [filter.comparator]
  })

  return availableComparators.reduce((agg, comparator) => {
    if (columnComparators.includes(comparator.id)) {
      agg[comparator.id] = true
    }

    return agg
  }, {} as Record<ComparatorEnum, boolean>)
})

function handleRemoveFilter() {
  column.value.filters = column.value.filters.filter(
    filter => filter.comparator !== props.filter.comparator,
  )

  // Refresh the table if the filter actually had a value OR the comparator was
  // one of the `Comparator.IS_EMPTY` or `Comparator.NOT_IS_EMPTY`
  const _isEmptyComparator = isEmptyComparator(props.filter.comparator)

  if (!isNil(props.filter.value) || _isEmptyComparator) {
    tableRefresh()
  }
}

function handleComparatorChange(comparator: ComparatorEnum) {
  // If the comparator was a selector comparator and now it's not, reset the value
  // If the comparator was not a selector comparator and now it is, reset the value
  const wasSelectComparator = isSelectorComparator(filter.value.comparator)
  const isSelectComparator = isSelectorComparator(comparator)

  // Same for empty comparator
  const wasEmptyComparator = isEmptyComparator(filter.value.comparator)
  const _isEmptyComparator = isEmptyComparator(comparator)

  if (wasSelectComparator && !isSelectComparator) {
    filter.value.value = undefined
  }

  if (!wasSelectComparator && isSelectComparator) {
    filter.value.value = []
  }

  if (wasEmptyComparator && !_isEmptyComparator) {
    filter.value.value = undefined
  }

  if (!wasEmptyComparator && _isEmptyComparator) {
    filter.value.value = undefined
  }

  // If the comparator was a date ago comparator and now it's not, reset the value
  // If the comparator was not a date ago comparator and now it is, reset the value
  const _wasDateAgoComparator = isDateAgoComparator(filter.value.comparator)
  const _isDateAgoComparator = isDateAgoComparator(comparator)

  if (_wasDateAgoComparator && !_isDateAgoComparator) {
    filter.value.value = undefined
  }

  if (!_wasDateAgoComparator && _isDateAgoComparator) {
    filter.value.value = '1d'
  }

  filter.value.comparator = comparator

  tableRefresh()

  nextTick(() => {
    valueInputEl.value?.focus?.()
  })
}

const tableRefreshDebounced = useDebounceFn(() => {
  tableRefresh()
}, inputDebounce.value || 0)

function handleValueChange(
  val: any,
  options?: { set?: boolean, debounce?: boolean },
) {
  const { set, debounce } = options ?? {}

  if (set) {
    filter.value.value = val
  }

  if (debounce) {
    tableRefreshDebounced()
  } else {
    tableRefresh()
  }
}

defineExpose({
  focus: () => valueInputEl.value?.focus?.(),
})
</script>

<template>
  <div class="table-column-filtering-item">
    <div
      v-if="!isBooleanishComparator"
      flex="~ gap-x-2"
    >
      <!-- Comparator -->
      <Selector
        :model-value="filter.comparator"
        :options="comparatorOptions"
        emit-key
        grow
        no-sort
        :hidden-options="hiddenComparators"
        hide-self
        size="sm"
        layout="regular"
        @update:model-value="handleComparatorChange"
      />

      <CrudBtnDelete
        v-if="!noDelete"
        size="sm"
        self-center
        no-confirm
        m="r-2"
        @delete="handleRemoveFilter"
      />
    </div>

    <!-- Custom component -->
    <Component
      :is="customFilterComponent.component"
      v-if="customFilterComponent?.comparators.includes(filter.comparator)"
      ref="valueInputEl"
      v-model="customValueComputed"
      v-bind="
        typeof customFilterComponent.props === 'function'
          ? customFilterComponent.props(customValueComputed, filter)
          : customFilterComponent.props
      "
      size="sm"
      :placeholder="`${$t('table.filterValue')}...`"
      @update:model-value="handleValueChange"
    />

    <!-- Selector for `Comparator.IN` and `Comparator.NOT_IN` for simple string cases -->
    <TextInput
      v-else-if="canUseSelectorComparator(filter.comparator, column) && !column.getDistinctData"
      ref="valueInputEl"
      v-model="customValue"
      size="sm"
      :debounce="500"
      :placeholder="`${$t('table.filterValue')}...`"
      empty-value=""
      layout="regular"
      @update:model-value="handleValueChange"
    />

    <!-- Selector of distinct values -->
    <Selector
      v-else-if="canUseSelectorComparator(filter.comparator, column)"
      ref="valueInputEl"
      v-model="filter.value"
      :load-data="{
        fnc: () => column.getDistinctData?.(column),
        local: true,
        immediate: true,
      }"
      :multi="isSelectorComparator(filter.comparator)"
      emit-key
      size="sm"
      layout="regular"
      :placeholder="`${$t('table.filterValue')}...`"
      @update:model-value="handleValueChange($event, { debounce: false })"
    />

    <!-- Ago value -->
    <QueryBuilderTimeAgoInput
      v-else-if="isDateAgoComparator(filter.comparator)"
      ref="valueInputEl"
      :item="filter"
      @update:model-value="handleValueChange"
    />

    <!-- Boolean value -->
    <QueryBuilderBooleanInput
      v-else-if="isBooleanishComparator"
      :item="filter"
      @update:item="tableRefresh"
      @remove:item="handleRemoveFilter"
    />

    <!-- Primitive value -->
    <Component
      :is="component.component"
      v-else-if="component?.component && !isNonValueComparator"
      v-bind="component.props"
      ref="valueInputEl"
      v-model="filter.value"
      size="sm"
      layout="regular"
      :placeholder="`${$t('table.filterValue')}...`"
      @update:model-value="handleValueChange($event, { set: true, debounce: true })"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-column-filtering-item {
  @apply flex flex-col flex-gap-y-1 rounded-custom border border-ca
    border-dotted p-1 bg-ca;
}
</style>
