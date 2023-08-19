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
const { getAvailableComparators, isSelectorComparator } = useTableUtils()

// Injections
const tableRefresh = injectStrict(tableRefreshKey)

// Layout
const inputEl = ref<any>()
const filter = toRef(props, 'filter')
const column = toRef(props, 'column')

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
  })
})

const hiddenComparators = computed(() => {
  const availableComparators = comparatorOptions.value
  const columnComparators = column.value.filters.map(
    filter => filter.comparator
  )

  return availableComparators.reduce((agg, comparator) => {
    if (columnComparators.includes(comparator)) {
      agg[comparator] = true
    }

    return agg
  }, {} as Record<ComparatorEnum, boolean>)
})

function handleRemoveFilter() {
  column.value.filters = column.value.filters.filter(
    filter => filter.comparator !== props.filter.comparator
  )

  // Refresh the table if the filter actually had a value
  if (props.filter.value) {
    tableRefresh()
  }
}

function handleComparatorChange(comparator: ComparatorEnum) {
  const wasSelectComparator = isSelectorComparator(filter.value.comparator)
  filter.value.comparator = comparator
  const isSelectComparator = isSelectorComparator(comparator)

  if (wasSelectComparator && !isSelectComparator) {
    filter.value.value = null
  }

  if (!wasSelectComparator && isSelectComparator) {
    filter.value.value = []
  }

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
    <div flex="~ gap-x-2">
      <!-- Comparator -->
      <Selector
        :model-value="filter.comparator"
        :options="comparatorOptions"
        emit-key
        grow
        :option-label="comparator => $t(`comparator.${comparator.id}`)"
        no-sort
        :hidden-options="hiddenComparators"
        hide-self
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

    <!-- Selector of distinct values -->
    <Selector
      v-if="column.getDistinctData"
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
      :placeholder="`${$t('table.filterValue')}...`"
      @update:model-value="handleCompareValueChange"
    />

    <!-- Compare value -->
    <Component
      :is="component.component"
      v-else
      v-bind="component.props"
      ref="inputEl"
      v-model="filter.value"
      :debounce="inputDebounce"
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
