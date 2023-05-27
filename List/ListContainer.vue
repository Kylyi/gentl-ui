<script setup lang="ts">
defineProps<{
  items: any[]
}>()

const listContainerEl = ref<HTMLDivElement>()

function scrollToIdx(idx: number) {
  const containerChildren = listContainerEl.value?.children

  if (containerChildren) {
    const child = containerChildren[
      Math.min(idx, containerChildren.length - 1)
    ] as HTMLElement

    if (child) {
      child.scrollIntoView()
    }
  }
}

defineExpose({
  getElement: () => unrefElement(listContainerEl),
  scrollToIdx,
})
</script>

<template>
  <div
    ref="listContainerEl"
    flex="1"
    style="max-height: 100%"
    overflow="auto"
  >
    <div
      v-for="(item, idx) in items"
      :key="item.id"
    >
      <slot
        :item="item"
        :index="idx"
      />
    </div>
  </div>
</template>
