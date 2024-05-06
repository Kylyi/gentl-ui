<script setup lang="ts">
import PerfectScrollbar from 'perfect-scrollbar'

// Types
import type { IScrollAreaProps } from '~/components/ScrollArea/types/scroll-area-props.type'

const props = defineProps<IScrollAreaProps>()

const scrollArea = ref<HTMLDivElement>()
const ps = ref<PerfectScrollbar>()

onMounted(() => {
  if (scrollArea.value) {
    ps.value = new PerfectScrollbar(scrollArea.value, {
      wheelSpeed: 0.1,
      ...(props.options || {}),
    })
  }
})

onBeforeUnmount(() => {
  ps.value?.destroy()
})

useResizeObserver(scrollArea, () => {
  ps.value?.update()
})

defineExpose({
  update: () => ps.value?.update(),
  scrollToBottom: () => {
    if (scrollArea.value) {
      setTimeout(
        () => (scrollArea.value!.scrollTop = scrollArea.value!.scrollHeight),
        0
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
