<script setup lang="ts">
// @ts-expect-error - vue-virtual-scroller missing types
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

defineProps<{
  items: any[]
}>()

const dynamicScrollerEl = ref<InstanceType<typeof DynamicScroller>>()

defineExpose({
  getElement: () => unrefElement(dynamicScrollerEl),
  scrollToIdx: (idx: number) => {
    dynamicScrollerEl.value?.scrollToItem(idx)
  },
})
</script>

<template>
  <DynamicScroller
    ref="dynamicScrollerEl"
    :items="items"
    :min-item-size="40"
    flex="1"
    style="max-height: 100%"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.label]"
        :data-index="index"
      >
        <slot
          :item="item"
          :index="index"
        />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
