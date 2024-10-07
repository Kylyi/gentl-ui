<script setup lang="ts">
import PerfectScrollbar from 'perfect-scrollbar'

// Types
import type { IScrollAreaProps } from '~/components/ScrollArea/types/scroll-area-props.type'

const props = defineProps<IScrollAreaProps>()

const scrollArea = ref<HTMLDivElement>()
const ps = ref<PerfectScrollbar>()

onMounted(() => {
  // We add timeout to prevent scrollbars to show when waiting for animation
  setTimeout(() => {
    if (scrollArea.value) {
      ps.value = new PerfectScrollbar(scrollArea.value, {
        wheelSpeed: 0.75,
        ...(props.options || {}),
      })
    }
  }, 300)
})

onBeforeUnmount(() => {
  ps.value?.destroy()
})

useResizeObserver(scrollArea, () => {
  requestAnimationFrame(() => {
    ps.value?.update()
  })
})

defineExpose({
  update: () => ps.value?.update(),
  scrollToBottom: () => {
    if (scrollArea.value) {
      setTimeout(
        () => (scrollArea.value!.scrollTop = scrollArea.value!.scrollHeight),
        0,
      )
    }
  },
})
</script>

<template>
  <div ref="scrollArea">
    <slot />
  </div>
</template>
