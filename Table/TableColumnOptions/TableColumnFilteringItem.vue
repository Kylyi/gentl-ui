<script setup lang="ts">
// Types
import { FilterItem } from '~/libs/App/data/models/filter-item'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Injections
import { tableRefreshKey } from '~/components/Table/provide/table.provide'

// Components
import { TableColumn } from '~/components/Table/models/table-column.model'

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
} = useTableUtils()

// Injections
const tableRefresh = injectStrict(tableRefreshKey)

// Layout
const inputEl = ref<any>()
const filter = toRef(props, 'filter')
const column = toRef(props, 'column')

const isBooleanishComparator = computedEager(() => {
  return BOOLEANISH_COMPARATORS.includes(filter.value.comparator)
})

const isNonValueComparator = computedEager(() => {
  return NON_VALUE_COMPARATORS.includes(filter.value.comparator)
})

const component = computed(() => {
  return COMPONENTS_BY_DATATYPE_MAP[column.value.dataType]
})

const inputDebounce = computed(() => {
  switch (props.column.dataType) {
    case 'string':
    case 'number':
      return 500

    default:
      return undefined
  }
})

const comparatorOptions = computed(() => {
  return getAvailableComparators(props.column.dataType, {
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
  return column.value.filterComponent ?? getCustomFilter(column.value)
})

const hiddenComparators = computed(() => {
  const availableComparators = comparatorOptions.value
  const columnComparators = column.value.filters.flatMap(filter => {
    const isBooleanishComparator = BOOLEANISH_COMPARATORS.includes(
      filter.comparator
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
    filter => filter.comparator !== props.filter.comparator
  )

  // Refresh the table if the filter actually had a value
  if (!isNil(props.filter.value)) {
    tableRefresh()
  }
}

function handleComparatorChange(comparator: ComparatorEnum) {
  // If the comparator was a selector comparator and now it's not, reset the value
  // If the comparator was not a selector comparator and now it is, reset the value
  const wasSelectComparator = isSelectorComparator(filter.value.comparator)
  const isSelectComparator = isSelectorComparator(comparator)

  if (wasSelectComparator && !isSelectComparator) {
    filter.value.value = undefined
  }

  if (!wasSelectComparator && isSelectComparator) {
    filter.value.value = []
  }

  // If the comparator was a date ago comparator and now it's not, reset the value
  // If the comparator was not a date ago comparator and now it is, reset the value
  const _wasDateAgoComparator = isDateAgoComparator(filter.value.comparator)
  const _isDateAgoComparator = isDateAgoComparator(comparator)

  if (_wasDateAgoComparator && !_isDateAgoComparator) {
    filter.value.value = undefined
  }

  if (!_wasDateAgoComparator && _isDateAgoComparator) {
    filter.value.value = '1m'
  }

  filter.value.comparator = comparator

  tableRefresh()
}

function handleCompareValueChange() {
  tableRefresh()
}

defineExpose({
  focus: () => inputEl.value?.focus?.(),
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
        fuse-extended-search-token="'"
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
      v-if="
        customFilterComponent &&
        customFilterComponent.comparators.includes(filter.comparator)
      "
      v-model="filter.value"
      v-bind="customFilterComponent.props"
      size="sm"
      :placeholder="`${$t('table.filterValue')}...`"
      @update:model-value="handleCompareValueChange"
    />

    <!-- Selector of distinct values -->
    <Selector
      v-else-if="canUseSelectorComparator(filter.comparator, column)"
      ref="inputEl"
      v-model="filter.value"
      :load-data="{
        fnc: () => column.getDistinctData?.(column),
        mapKey: 'doesnt-really-matter',
        local: true,
        immediate: true,
      }"
      :multi="isSelectorComparator(filter.comparator)"
      emit-key
      option-key="_value"
      option-label="_label"
      size="sm"
      fuse-extended-search-token="'"
      :placeholder="`${$t('table.filterValue')}...`"
      @update:model-value="handleCompareValueChange"
    />

    <!-- Ago value -->
    <QueryBuilderTimeAgoInput
      v-else-if="isDateAgoComparator(filter.comparator)"
      :item="filter"
      @update:model-value="handleCompareValueChange"
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
      v-else-if="component.component && !isNonValueComparator"
      v-bind="component.props"
      ref="inputEl"
      v-model="filter.value"
      :debounce="inputDebounce"
      size="sm"
      :placeholder="`${$t('table.filterValue')}...`"
      @update:model-value="handleCompareValueChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-column-filtering-item {
  --apply: flex flex-col flex-gap-y-1 rounded-custom border border-ca
    border-dotted p-1 bg-ca;
}
</style>
