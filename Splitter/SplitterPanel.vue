<script setup lang="ts">
// Components
import Splitter from '~/components/Splitter/Splitter.vue'

// Types
import type { ISplitterPanelProps } from '~/components/Splitter/types/splitter-panel.type'

const props = defineProps<ISplitterPanelProps>()

// Layout
const component = ref<HTMLElement>()
const slots = useSlots()
const minSize = toRef(props, 'minSize')

const nestedState = ref<boolean | null>(null)
const isNested = computed(() => {
  return slots.default?.().some(child => {
    nestedState.value = child.type === Splitter ? true : null
    return nestedState.value
  })
})
const splitterPanelClass = computed(() => {
  return [
    'splitter-panel',
    {
      'splitter-panel-nested': isNested.value,
    },
  ]
})

defineExpose({
  getElement: () => component.value,
  getPanelMinSize: () => minSize.value,
})
</script>

<template>
  <div
    ref="component"
    :class="splitterPanelClass"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss">
.splitter-panel {
  --apply: flex flex-grow overflow-hidden;
}

.splitter-panel-nested {
  --apply: flex flex-col;
}

.splitter-panel .splitter {
  --apply: flex-grow border-0;
}
</style>
