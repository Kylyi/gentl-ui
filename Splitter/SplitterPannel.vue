<script setup lang="ts">
// Components
import Splitter from '~/components/Splitter/Splitter.vue'

// Types
import type { ISplitterPanelProps } from '~/components/Splitter/types/splitter-panel.type'

const props = defineProps<ISplitterPanelProps>()

// Layout
const component = ref<HTMLElement>()
const slots = useSlots()

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

const splitterPanelStyle = computed(() => {
  const basis = props.size ? `calc(${props.size}% - 4px)` : '1 1 auto'
  return {
    flexBasis: basis,
    minWidth: props.minSize ? `${props.minSize}px` : '0',
  }
})

defineExpose({
  getElement: () => component.value,
})
</script>

<template>
  <div
    ref="component"
    :class="splitterPanelClass"
    :style="splitterPanelStyle"
  >
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.splitter-panel {
  --apply: rounded-custom grow overflow-hidden;
}

.splitter-panel-nested {
  --apply: flex-col;
}

.splitter-panel .splitter {
  --apply: grow border-0;
}
</style>
