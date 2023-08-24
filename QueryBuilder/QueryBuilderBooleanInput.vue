<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

type IProps = {
  item: Pick<IQueryBuilderItem, 'value' | 'comparator'>
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:item', val: any): void
}>()

// Layout
const item = toRef(props, 'item')

function handleUpdateValue(val?: any) {
  item.value.comparator = val
  item.value.value = config.table.booleanValue

  emits('update:item', item.value)
}
</script>

<template>
  <Toggle
    :model-value="item.value ? item.comparator : null"
    :check-value="ComparatorEnum.IS"
    :uncheck-value="ComparatorEnum.NOT_IS"
    container-class="p-x-3"
    @update:model-value="handleUpdateValue"
  >
    <template #prepend>
      <span>
        {{ $t('general.isNot') }}
      </span>
    </template>
    <template #append>
      <span>
        {{ $t('comparator.is') }}
      </span>
    </template>
  </Toggle>
</template>
