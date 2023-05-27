<script setup lang="ts">
// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// COMPONENTS
import NumberInput from '~/components/Inputs/NumberInput/NumberInput.vue'
import TextInput from '~/components/Inputs/TextInput/TextInput.vue'
import DateInput from '~/components/Inputs/DateInput/DateInput.vue'
import MonthSelector from '~/components/MonthSelector/MonthSelector.vue'
import Checkbox from '~/components/Checkbox/Checkbox.vue'
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

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

// LAYOUT
const column = toRef(props, 'column')

const comparatorOptions = computed(() => {
  return COMPARATORS_BY_DATATYPE[props.column.dataType]
})

const CompareInput = computed(() => {
  return INPUT_BY_DATATYPE[props.column.dataType]
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
      label-inside
      :option-label="comparator => $t(`comparator.${comparator.id}`)"
    />

    <!-- COMPARE VALUE -->
    <Component
      :is="CompareInput"
      v-model="column.compareValue"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-column-filtering-chips {
  --apply: flex flex-col flex-gap-y-2 p-x-3 p-y-2;
}
</style>
