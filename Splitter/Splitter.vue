<script setup lang="ts">
// Types
import type {
  ISplitterEmit,
  ISplitterProps,
} from '~/components/Splitter/types/splitter.type'

import SplitterPanel from '~/components/Splitter/SplitterPannel.vue'

const props = defineProps<ISplitterProps>()

defineEmits<ISplitterEmit>()

// Utils
const slots = useSlots()

// Layout
const panels = computed(() => {
  const panels: any[] = []

  slots.default?.().forEach((child: any) => {
    if (isSplitterPanel(child)) {
      panels.push(child)
    } else if (Array.isArray(child.children)) {
      child.children.forEach((child: any) => {
        if (isSplitterPanel(child)) {
          panels.push(child)
        }
      })
    }
  })

  return panels
})

// Functions
function isSplitterPanel(child: any) {
  return child.type.name === SplitterPanel
}
</script>

<template>
  <div :data-p-resizing="false">
    <template
      v-for="(panel, i) of panels"
      :key="i"
    >
      <!-- Pannel -->
      <component
        :is="panel"
        tabindex="-1"
      ></component>

      <!-- Gutter (the handler to resise) -->
    </template>
  </div>
</template>

<style scoped lang="scss"></style>
