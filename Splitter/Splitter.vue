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
const gutterEl = ref<HTMLElement>()
const gutterElement = ref<HTMLElement>()
const splitterClasses = computed(() => {
  return ['p-splitter', `p-splitter-${props.layout}`]
})
// Functions
function isSplitterPanel(child: VNode) {
  return child.type === SplitterPanel
}
function onResizeStart(event: any, index: number) {
  gutter.value = event.target as HTMLElement
}

function onGutterTouchStart(event: TouchEvent, index: number) {
  // [1]- Resize start
  // [2]- Add event listeners
  // Prevent default
}
function onGutterTouchMove(event: TouchEvent, index: number) {}
function onGutterTouchEnd(event: TouchEvent, index: number) {}
</script>

<template>
  <div
    :class="splitterClasses"
    :data-p-resizing="false"
  >
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
      <div
        v-if="i !== panels.length - 1"
        ref="gutterEl"
        role="separator"
        tabindex="-1"
        class="p-splitter-gutter"
        :data-p-gutter-resizing="false"
        @touchstart="onGutterTouchStart($event, i)"
        @touchmove="onGutterTouchMove($event, i)"
        @touchend="onGutterTouchEnd($event, i)"
      >
        <div class="p-splitter-gutter-handle"></div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
// Splitter [default is horizontal]
.p-splitter {
  display: flex;
  flex-wrap: nowrap;
}

.p-splitter-vertical {
  flex-direction: column;
}

// Splitter gutter
.p-splitter-gutter {
  flex-grow: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: col-resize;
  width: 4px;
  background-color: gray;
}

.p-splitter-horizontal.p-splitter-resizing {
  cursor: col-resize;
  user-select: none;
}

.p-splitter-horizontal > .p-splitter-gutter > .p-splitter-gutter-handle {
  height: 24px;
  width: 100%;
}

.p-splitter-horizontal > .p-splitter-gutter {
  cursor: col-resize;
}

.p-splitter-vertical.p-splitter-resizing {
  cursor: row-resize;
  user-select: none;
}

.p-splitter-vertical > .p-splitter-gutter {
  cursor: row-resize;
  width: 100%;
  height: 4px;
  background-color: gray;
}

.p-splitter-vertical > .p-splitter-gutter > .p-splitter-gutter-handle {
  width: 24px;
  height: 100%;
}
</style>
