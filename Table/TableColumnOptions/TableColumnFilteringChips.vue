<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// COMPONENTS
import NumberInput from '~/components/Inputs/NumberInput/NumberInput.vue'
import TextInput from '~/components/Inputs/TextInput/TextInput.vue'
import DateInput from '~/components/Inputs/DateInput/DateInput.vue'
import MonthSelector from '~/components/MonthSelector/MonthSelector.vue'
import Checkbox from '~/components/Checkbox/Checkbox.vue'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// CONSTANTS
const COMPARATORS_BY_DATATYPE: Record<DataType, ComparatorEnum[]> = {
  string: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.STARTS_WITH,
    ComparatorEnum.ENDS_WITH,
    ComparatorEnum.CONTAINS,
    ComparatorEnum.NOT_CONTAINS,
  ],
  number: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
  ],
  date: [
    ComparatorEnum.BETWEEN,
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
  ],
  yearMonth: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
  ],
}

const INPUT_BY_DATATYPE: Record<DataType, any> = {
  string: TextInput,
  number: NumberInput,
  date: DateInput,
  yearMonth: MonthSelector,
  boolean: Checkbox,
  percent: NumberInput,
}

// UTILS
const updateTableState = injectStrict(updateTableStateKey)

// LAYOUT
const inputEl = ref<any>()
const column = toRef(props, 'column')

const comparatorOptions = computed(() => {
  return COMPARATORS_BY_DATATYPE[props.column.dataType]
})

const CompareInput = computed(() => {
  return INPUT_BY_DATATYPE[props.column.dataType]
})

function handleComparatorChange(comparator: ComparatorEnum) {
  if (comparator === ComparatorEnum.BETWEEN) {
    column.value.compareValue = [null, null]
  } else {
    column.value.compareValue = null
  }
}

function handleColumnChange() {
  updateTableState({}, tableState => {
    const foundColumn = tableState.columns.find(
      column => column.field === props.column.field
    )

    if (foundColumn) {
      foundColumn.comparator = props.column.comparator
      foundColumn.compareValue = props.column.compareValue
    } else {
      tableState.columns.push({
        field: props.column.field,
        comparator: props.column.comparator,
        width: props.column.width,
        sort: props.column.sort,
        sortOrder: props.column.sortOrder,
        compareValue: props.column.compareValue,
      })
    }

    return tableState
  })
}

onMounted(() => {
  setTimeout(() => {
    inputEl.value?.focus?.()
  }, 350)
})
</script>

<template>
  <div class="table-column-filtering-chips">
    <!-- COMPARATOR -->
    <Selector
      v-model="column.comparator"
      :options="comparatorOptions"
      emit-key
      :label="$t('comparator.self')"
      :option-label="comparator => $t(`comparator.${comparator.id}`)"
    />

    <!-- COMPARE VALUE -->
    <Component
      :is="CompareInput"
      v-if="column.comparator !== ComparatorEnum.BETWEEN"
      ref="inputEl"
      v-model="column.compareValue"
      :debounce="500"
      :placeholder="`${$t('table.filterValue')}...`"
      @update:model-value="handleColumnChange"
    />

    <!-- COMPARE VALUE FOR ComparatorEnum.BETWEEN -->
    <template v-else>
      <Component
        :is="CompareInput"
        ref="inputEl"
        v-model="column.compareValue"
        :debounce="500"
        :placeholder="`${$t('table.filterValue')}...`"
        @update:model-value="handleColumnChange"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.table-column-filtering-chips {
  --apply: flex flex-col flex-gap-y-2 p-x-3 p-y-2;
}
</style>
