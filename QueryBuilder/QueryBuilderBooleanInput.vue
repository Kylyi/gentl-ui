<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

type IProps = {
  dataType: DataType
  item: Pick<IQueryBuilderItem, 'value' | 'comparator'>
  noDelete?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:item', val: any): void
  (e: 'remove:item'): void
}>()

// Layout
const item = toRef(props, 'item')

const isBooleanDataType = computedEager(() => {
  const booleanDataTypes = ['boolean', 'bool']

  return booleanDataTypes.includes(props.dataType)
})

function handleUpdateValue(val?: any) {
  if (isBooleanDataType.value) {
    item.value.value = val
  } else {
    item.value.value = config.table.emptyValue
    item.value.comparator = val
  }

  emits('update:item', item.value)
}
</script>

<template>
  <Toggle
    :model-value="isBooleanDataType ? item.value : item.comparator"
    :check-value="isBooleanDataType ? false : ComparatorEnum.IS"
    :uncheck-value="isBooleanDataType ? true : ComparatorEnum.NOT_IS"
    container-class="p-l-3 p-r-2"
    :visuals="{
      unchecked: { bullet: 'bg-positive' },
      checked: { bullet: 'bg-negative' },
    }"
    @update:model-value="handleUpdateValue"
  >
    <template #prepend>
      <span>
        {{ isBooleanDataType ? $t('yes') : $t('general.isNotEmpty') }}
      </span>
    </template>
    <template #append>
      <span grow>
        {{ isBooleanDataType ? $t('no') : $t('comparator.isEmpty') }}
      </span>

      <!-- Remove -->
      <Btn
        v-if="!noDelete"
        size="sm"
        preset="TRASH"
        no-dim
        @mousedown.stop
        @click.stop.prevent="$emit('remove:item')"
      />
    </template>
  </Toggle>
</template>
