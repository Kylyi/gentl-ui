<script setup lang="ts">
// MODELS
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'
import { FilterItem } from '~/libs/App/data/models/filter-item'

// COMPOSITION FUNCTIONS
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// COMPONENTS
import { TableColumn } from '~/components/Table/models/table-column.model'
import { TableColumnState } from '~/components/Table/models/table-column-state.model'

// INJECTION KEYS
import {
  refreshTableDataKey,
  updateTableStateKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  column: TableColumn<any>
  filter: FilterItem<any>
  noDelete?: boolean
}

const props = defineProps<IProps>()

// INJECTIONS
const updateTableState = injectStrict(updateTableStateKey)
const refreshData = injectStrict(refreshTableDataKey)

// UTILS
const { getAvailableComparators, getInputByDataType, isSelectorComparator } =
  useTableUtils()

// LAYOUT
const inputEl = ref<any>()
const filter = toRef(props, 'filter')
const column = toRef(props, 'column')
const preventRefreshData = refAutoReset(false, 100)

const comparatorOptions = computed(() => {
  return getAvailableComparators(props.column.dataType, {
    includeSelectorComparators: !!column.value.getDistinctData,
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

const CompareInput = computed(() => {
  return getInputByDataType(props.column.dataType)
})

function handleRemoveFilter() {
  column.value.filters = column.value.filters.filter(
    filter => filter.comparator !== props.filter.comparator
  )

  updateTableState({}, state => {
    const foundColumn = state.columns.find(
      column => column.field === props.column.field
    )

    if (foundColumn) {
      const foundFilterIdx = foundColumn.filters.findIndex(
        filter => filter.comparator === props.filter.comparator
      )

      if (foundFilterIdx > -1) {
        foundColumn.filters.splice(foundFilterIdx, 1)
      }
    } else {
      state.columns.push(new TableColumnState(props.column))
    }

    return state
  })
  refreshData()
}

// Watch for comparator change to reset the `compareValue` if needed
watch(
  () => filter.value.comparator,
  (comparator, oldComparator) => {
    const wasSelectComparator =
      oldComparator && isSelectorComparator(oldComparator)
    const isSelectComparator = isSelectorComparator(comparator)

    if (wasSelectComparator && !isSelectComparator) {
      filter.value.compareValue = null
      preventRefreshData.value = true
    }

    if (!wasSelectComparator && isSelectComparator) {
      filter.value.compareValue = []
      preventRefreshData.value = true
    }
  }
)

// Watch for changes to refresh data and save the state
watch([() => filter.value.comparator, () => filter.value.compareValue], () => {
  nextTick(() => {
    if (preventRefreshData.value) {
      return
    }

    updateTableState({}, state => {
      const foundColumn = state.columns.find(
        column => column.field === props.column.field
      )

      if (foundColumn) {
        const foundFilter = foundColumn.filters.find(
          filter => filter.comparator === props.filter.comparator
        )

        if (foundFilter) {
          foundFilter.comparator = filter.value.comparator
          foundFilter.compareValue = filter.value.compareValue
        } else {
          foundColumn.filters.push(new FilterItem(filter.value))
        }
      } else {
        state.columns.push(new TableColumnState(props.column))
      }

      return state
    })

    refreshData()
  })
})

defineExpose({
  focus: () => inputEl.value?.focus(),
})
</script>

<template>
  <div class="table-column-filtering-item">
    <div flex="~ gap-x-2">
      <!-- COMPARATOR -->
      <Selector
        v-model="filter.comparator"
        :options="comparatorOptions"
        emit-key
        grow
        :option-label="comparator => $t(`comparator.${comparator.id}`)"
        no-sort
        :hidden-options="hiddenComparators"
        hide-self
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

    <!-- COMPARE VALUE -->
    <Component
      :is="CompareInput"
      v-if="!isSelectorComparator(filter.comparator)"
      ref="inputEl"
      v-model="filter.compareValue"
      :debounce="500"
      :placeholder="`${$t('table.filterValue')}...`"
    />

    <!-- SELECTOR -->
    <Selector
      v-else-if="props.column.getDistinctData"
      v-model="filter.compareValue"
      :load-data="{
        fnc: () => props.column.getDistinctData?.(props.column),
        mapKey: 'doesnt-really-matter',
        local: true,
      }"
      multi
      option-key="_value"
      option-label="_label"
      :placeholder="`${$t('table.filterValue')}...`"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-column-filtering-item {
  --apply: flex flex-col flex-gap-y-1 rounded-custom border border-ca
    border-dotted p-1 bg-ca;
}
</style>
