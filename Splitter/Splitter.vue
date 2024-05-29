<!-- eslint-disable unused-imports/no-unused-vars -->
<script setup lang="ts">
// Types
import { type CSSProperties } from 'vue'
import type {
  ISplitterEmit,
  ISplitterProps,
} from '~/components/Splitter/types/splitter.type'

// Components
import SplitterPanel from '~/components/Splitter/SplitterPannel.vue'

// Utils
import { useDomUtils } from '~/components/Splitter/functions/useDomUtils'
import { useSplitterUtils } from '~/components/Splitter/functions/useSplitterUtils'

const props = withDefaults(defineProps<ISplitterProps>(), {
  gutterSize: 4,
})

const emits = defineEmits<ISplitterEmit>()

// Utils
const slots = useSlots()
const { getOuterHeight, getOuterWidth } = useDomUtils()
const { validatePanelReszie } = useSplitterUtils()

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

const horizontal = computed(() => props.layout === 'horizontal')
const size = ref<number>(0)
const prevSize = ref<string>('0')
const prevPanelEl = ref<HTMLElement>()
const nextPanelEl = ref<HTMLElement>()
const prevPanelSize = ref<number>(0)
const nextPanelSize = ref<number>(0)
const panelSizes = ref<number[]>([])
const prevPanelIndex = ref<number>(0)
const startPos = ref<number>(0)
const dragging = ref(false)

const splitterEl = ref<HTMLElement>()
const gutterEl = ref<HTMLElement[]>()
const gutterElement = ref<HTMLElement>()

const splitterClasses = computed(() => {
  return ['p-splitter', `p-splitter-${props.layout}`]
})

const gutterStyle = computed<CSSProperties>(() => ({
  [horizontal.value ? 'width' : 'height']: `${props.gutterSize}px`,
}))

// Listeners
const mouseMoveListener = ref<(event: MouseEvent) => void>()
const mouseUpListener = ref<(event: MouseEvent) => void>()

// Functions
function isSplitterPanel(child: VNode) {
  return child.type === SplitterPanel
}

function onResizeStart(
  event: TouchEvent | MouseEvent,
  index: number,
  isKeyDown?: boolean
) {
  // [1]- Get the gutter element
  const eventCurrentTarget = event.currentTarget as HTMLElement
  const eventTarget = event.target as HTMLElement

  gutterElement.value = eventCurrentTarget || eventTarget.parentElement

  // [2]- Set the size of the splitter
  if (splitterEl.value) {
    size.value = horizontal.value
      ? splitterEl.value.clientWidth
      : splitterEl.value.clientHeight
  }

  // [3]- Set the start position and dragging state
  if (!isKeyDown) {
    dragging.value = true
    startPos.value =
      props.layout === 'horizontal'
        ? event instanceof MouseEvent
          ? event.pageX
          : event.changedTouches[0].pageX
        : event instanceof MouseEvent
        ? event.pageY
        : event.changedTouches[0].pageY
  }

  // [4]- Set the previous and next panel [because we need to resize them]
  prevPanelEl.value = gutterElement.value?.previousElementSibling as HTMLElement
  nextPanelEl.value = gutterElement.value?.nextElementSibling as HTMLElement

  // [5]- Set the previous and next panel size [because we need to resize them]
  // If key is down means we are resizing with the keyboard, otherwise we are resizing with the mouse or touch
  if (isKeyDown) {
    prevPanelSize.value = horizontal.value
      ? getOuterWidth(prevPanelEl.value, true)
      : getOuterHeight(prevPanelEl.value, true)

    nextPanelSize.value = horizontal.value
      ? getOuterWidth(nextPanelEl.value, true)
      : getOuterHeight(nextPanelEl.value, true)
  } else {
    prevPanelSize.value =
      (100 *
        (horizontal.value
          ? getOuterWidth(prevPanelEl.value, true)
          : getOuterHeight(prevPanelEl.value, true))) /
      size.value

    nextPanelSize.value =
      (100 *
        (horizontal.value
          ? getOuterWidth(nextPanelEl.value, true)
          : getOuterHeight(nextPanelEl.value, true))) /
      size.value
  }

  // [6]- Set the previous panel index
  prevPanelIndex.value = index

  // [7]- Emit event
  emits('resizestart', { originalEvent: event, sizes: panelSizes.value })

  if (gutterEl.value) {
    gutterEl.value[index].setAttribute('data-p-gutter-resizing', 'true')
  }

  splitterEl.value?.setAttribute('data-p-resizing', 'true')
}

function onResize(
  event: TouchEvent | MouseEvent,
  step: number = 5,
  isKeyDown?: boolean
) {
  let newPos, newPrevPanelSize, newNextPanelSize

  if (isKeyDown) {
    if (horizontal.value) {
      newPrevPanelSize = (100 * (prevPanelSize?.value + step)) / size.value
      newNextPanelSize = (100 * (nextPanelSize?.value - step)) / size.value
    } else {
      newPrevPanelSize = (100 * (prevPanelSize?.value - step)) / size.value
      newNextPanelSize = (100 * (nextPanelSize?.value + step)) / size.value
    }
  } else {
    if (event instanceof MouseEvent) {
      if (horizontal.value) {
        newPos =
          (event.pageX * 100) / size.value - (startPos.value * 100) / size.value
      } else {
        newPos =
          (event.pageY * 100) / size.value - (startPos.value * 100) / size.value
      }
    }

    if (!isNil(newPos)) {
      newPrevPanelSize = prevPanelSize.value + newPos
      newNextPanelSize = nextPanelSize.value - newPos
    }
  }

  // TODO: Validate before resizing
  if (
    validatePanelReszie(
      newPrevPanelSize,
      newNextPanelSize,
      prevPanelIndex.value,
      panels.value
    )
  ) {
    if (prevPanelEl.value && nextPanelEl.value) {
      prevPanelEl.value.style.flexBasis = `calc(${newPrevPanelSize}% -
    ${(panels.value.length - 1) * props.gutterSize}px)`

      nextPanelEl.value.style.flexBasis = `calc(${newNextPanelSize}% -
     ${(panels.value.length - 1) * props.gutterSize}px)`
    }

    if (!isNil(newPrevPanelSize) && !isNil(newNextPanelSize)) {
      panelSizes.value[prevPanelIndex.value] = newPrevPanelSize
      panelSizes.value[prevPanelIndex.value + 1] = newNextPanelSize
      prevSize.value = Number.parseFloat(newPrevPanelSize.toString()).toFixed(4)
    }

    emits('resize', { originalEvent: event, sizes: panelSizes.value })
  }
}

function onResizeEnd(event: TouchEvent | MouseEvent) {
  // [1]- Things about state
  // [2]- Emit event
  emits('resizeend', { originalEvent: event, sizes: panelSizes.value })
  // [3]- For each gutter, set the resizing state to false
  gutterEl.value?.forEach(gutter =>
    gutter.setAttribute('data-p-gutter-resizing', 'false')
  )
  // [4]- For the splitter, set the resizing state to false
  splitterEl.value?.setAttribute('data-p-resizing', 'false')

  clear()
}

function onGutterMouseDown(event: MouseEvent, index: number) {
  onResizeStart(event, index)
  bindMouseListeners()
}

function bindMouseListeners() {
  if (!mouseMoveListener.value) {
    mouseMoveListener.value = (event: MouseEvent) => onResize(event)
    document.addEventListener('mousemove', mouseMoveListener.value)
  }

  if (!mouseUpListener.value) {
    mouseUpListener.value = (event: MouseEvent) => {
      onResizeEnd(event)
      unbindMouseListeners()
    }

    document.addEventListener('mouseup', mouseUpListener.value)
  }
}

function unbindMouseListeners() {
  if (mouseMoveListener.value) {
    document.removeEventListener('mousemove', mouseMoveListener.value)
    mouseMoveListener.value = undefined
  }

  if (mouseUpListener.value) {
    document.removeEventListener('mouseup', mouseUpListener.value)
    mouseUpListener.value = undefined
  }
}

function clear() {
  // Clear dragging state
  dragging.value = false

  // Clear size
  size.value = 0

  // Clear start position
  startPos.value = 0

  // Clear [previous, next] panel
  prevPanelEl.value = undefined
  nextPanelEl.value = undefined

  // Clear [previous, next] panel size
  prevPanelSize.value = 0
  nextPanelSize.value = 0

  // Clear gutter element
  gutterElement.value = undefined

  // Clear previous panel index
  prevPanelIndex.value = 0
}

// Lifecycle
onMounted(() => {})
onUnmounted(() => {})
</script>

<template>
  <div
    ref="splitterEl"
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
      />

      <!-- Gutter (the handler to resise) -->
      <div
        v-if="i !== panels.length - 1"
        ref="gutterEl"
        role="separator"
        tabindex="-1"
        class="p-splitter-gutter"
        :data-p-gutter-resizing="false"
        @mousedown="onGutterMouseDown($event, i)"
      >
        <div
          class="p-splitter-gutter-handle"
          tabindex="0"
          :style="[gutterStyle]"
        ></div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.p-splitter {
  --apply: flex flex-row flex-nowrap;
}

.p-splitter-vertical {
  --apply: flex flex-col;
}

// Splitter gutter
.p-splitter-gutter {
  --apply: flex shrink-0 grow-0 items-center justify-center cursor-col-resize
    bg-gray-600;
}

.p-splitter-horizontal.p-splitter-resizing {
  --apply: cursor-col-resize select-none;
}

.p-splitter-horizontal > .p-splitter-gutter > .p-splitter-gutter-handle {
  --apply: w-full h-6;
}

.p-splitter-horizontal > .p-splitter-gutter {
  --apply: cursor-col-resize;
}

.p-splitter-vertical.p-splitter-resizing {
  --apply: cursor-row-resize select-none;
}

.p-splitter-vertical > .p-splitter-gutter {
  --apply: cursor-row-resize w-full bg-gray-600;
}

.p-splitter-vertical > .p-splitter-gutter > .p-splitter-gutter-handle {
  --apply: h-full w-6;
}
</style>
