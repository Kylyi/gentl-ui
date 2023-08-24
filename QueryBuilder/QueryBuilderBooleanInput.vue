<script setup lang="ts">
// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'

type IProps = {
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

const model = computed({
  get() {
    if (isNil(item.value.value)) {
      return null
    }

    return JSON.parse(item.value.value)
  },
  set(val?: any) {
    item.value.value = val

    emits('update:item', item.value)
  },
})

const positiveBtnClass = computed(() => {
  return model.value
    ? ['bg-positive', 'border-green-800', 'color-white']
    : ['color-positive', 'border-positive']
})

const negativeBtnClass = computed(() => {
  return model.value === false
    ? ['bg-negative', 'border-red-800', 'color-white']
    : ['color-negative', 'border-negative']
})
</script>

<template>
  <div
    flex="~ gap-1"
    p="l-1 r-2"
  >
    <Btn
      size="sm"
      no-uppercase
      grow
      border="l-4"
      :class="positiveBtnClass"
      :label="$t('yes')"
      @click="model = true"
    />
    <Btn
      size="sm"
      no-uppercase
      grow
      border="r-4"
      :class="negativeBtnClass"
      :label="$t('no')"
      @click="model = false"
    />

    <!-- Remove -->
    <Btn
      v-if="!noDelete"
      size="sm"
      preset="TRASH"
      no-dim
      flex="shrink-0"
      @mousedown.stop
      @click.stop.prevent="$emit('remove:item')"
    />
  </div>
</template>
