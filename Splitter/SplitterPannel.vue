<script setup lang="ts">
// Types
import type { ISplitterPannelProps } from '~/components/Splitter/types/splitter-pannel.type'

const props = defineProps<ISplitterPannelProps>()

// Layout
const component = ref<HTMLElement>()
const slots = useSlots()
const nestedState = ref<boolean | null>(null)
const isNested = computed(() => {
  return slots.default?.().some(child => {
    nestedState.value = (child.type as any).name === 'Splitter' ? true : null
    return nestedState.value
  })
})
const splitterPannelClass = computed(() => {
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
    :class="splitterPannelClass"
    :style="splitterPanelStyle"
  >
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.splitter-panel {
  flex-grow: 1;
  overflow: hidden;
}

.splitter-panel-nested {
  display: flex;
}

.splitter-panel .splitter {
  flex-grow: 1;
  border: 0 none;
}
</style>
