<script setup lang="ts" generic="T extends IItem">
type IProps = {
  items: T[]
  itemKey?: string
  hasInfiniteScroll?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  itemKey: 'id',
})

const emits = defineEmits<{
  (e: 'infinite-scroll'): void
}>()

// Layout
const listContainerEl = ref<HTMLDivElement>()

useScroll(listContainerEl, {
  onScroll() {
    if (!props.hasInfiniteScroll) {
      return
    }

    const containerEl = unrefElement(listContainerEl)

    if (!containerEl) {
      return
    }

    // Check if we are infinite-scrolling
    const THRESHOLD = 400 // Let's assume 40px per row => 10 rows
    const remainingScroll
      = containerEl.scrollHeight
      - containerEl.clientHeight
      - containerEl.scrollTop

    if (remainingScroll <= THRESHOLD) {
      emits('infinite-scroll')
    }
  },
})

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
      :key="get(item, itemKey)"
    >
      <slot
        :item="item"
        :index="idx"
      />
    </div>
  </div>
</template>
