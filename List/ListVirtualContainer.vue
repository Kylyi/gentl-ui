<script setup lang="ts">
defineProps<{
  items: any[]
}>()

const dynamicScrollerEl = ref<HTMLDivElement>()

defineExpose({
  getElement: () => unrefElement(dynamicScrollerEl),
  scrollToIdx: (idx: number) => {
    //
    // dynamicScrollerEl.value?.scrollToItem(idx)
  },
})
</script>

<template>
  <!-- TODO -->
  <div ref="dynamicScrollerEl">TODO</div>
  <!-- <DynamicScroller
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
  </DynamicScroller> -->
</template>
