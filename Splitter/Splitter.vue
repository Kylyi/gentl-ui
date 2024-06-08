<script setup lang="ts">
// Types
import type {
  ISplitterEmit,
  ISplitterProps,
} from '~/components/Splitter/types/splitter.type'

// Components
import SplitterPanel from '~/components/Splitter/SplitterPanel.vue'

// Utils
import { useDomUtils } from '~/components/Splitter/functions/useDomUtils'
import { useSplitterUtils } from '~/components/Splitter/functions/useSplitterUtils'
import { useSplitterLayout } from '~/components/Splitter/functions/useSplitterLayout'

const props = withDefaults(defineProps<ISplitterProps>(), {
  gutterSize: 10,
  step: 5,
  ui: () => ({
    noResizeArrowHint: true,
  }),
})

const emits = defineEmits<ISplitterEmit>()

// Utils
const slots = useSlots()
const { getOuterHeight, getOuterWidth } = useDomUtils()
const { validatePanelReszie } = useSplitterUtils(props)
const {
  horizontal,
  intersectHorizontal,
  gutterHandlerCollapseNextClasses,
  gutterHandlerCollapsePreviousClasses,
  gutterHandlerBottomInterSectionClasses,
  gutterHandlerTopInterSectionClasses,
  gutterStyle,
  splitterClasses,
  isIntersectionArea,
} = useSplitterLayout(props)

// Layout
const panels = computed(() => {
  const panels: VNode[] = []

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

const splitterEl = ref<HTMLElement>()

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

const multidirectionalParentSplitter = ref<HTMLElement>()
const multidirectionParentSplitterSize = ref<number>(0)
const parentPanelEl = ref<HTMLElement>()
const prevParentPanelEl = ref<HTMLElement>()
const prevParentPanelSize = ref<number>(0)
const nextParentPanelEl = ref<HTMLElement>()
const nextParentPanelSize = ref<number>(0)
const intersectStartPos = ref<number>(0)
const intersectionParentPanelSize = ref<number>(0)
const isMultidirectionalResizing = ref(false)

const gutterEls = ref<HTMLElement[]>()
const gutterElement = ref<HTMLElement>()

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
  // Get the gutter element
  const eventCurrentTarget = event.currentTarget as HTMLElement
  const eventTarget = event.target as HTMLElement

  gutterElement.value = eventCurrentTarget || eventTarget.parentElement

  // Checking for multidirectional resizing (Applicable only for mouse events)
  if (event instanceof MouseEvent) {
    if (isIntersectionArea(event)) {
      isMultidirectionalResizing.value = true
      onMultiDirectionResizeStart(event)
    } else {
      isMultidirectionalResizing.value = false
    }
  }

  // Set the size of the splitter (that have panels inside it) - according to the layout
  if (splitterEl.value) {
    size.value = horizontal.value
      ? splitterEl.value.clientWidth
      : splitterEl.value.clientHeight
  }

  // Set the start position and dragging state
  if (!isKeyDown) {
    dragging.value = true

    if (horizontal.value) {
      if (event instanceof MouseEvent) {
        startPos.value = event.pageX
      } else {
        startPos.value = event.changedTouches[0].pageX
      }
    } else {
      if (event instanceof MouseEvent) {
        startPos.value = event.pageY
      } else {
        startPos.value = event.changedTouches[0].pageY
      }
    }
  }

  // Set the previous and next panel elements [because we need to resize them]
  prevPanelEl.value = gutterElement.value?.previousElementSibling as HTMLElement
  nextPanelEl.value = gutterElement.value?.nextElementSibling as HTMLElement

  // Set the previous and next panel size [because we need to resize them]
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

  // Set the previous panel index
  prevPanelIndex.value = index

  // Emit event
  emits('resizestart', { originalEvent: event })

  if (gutterEls.value) {
    gutterEls.value[index].setAttribute('data-p-gutter-resizing', 'true')
  }
  // Set the resizing state
  splitterEl.value?.setAttribute('data-p-resizing', 'true')
}

function onMultiDirectionResizeStart(event: MouseEvent) {
  const { pageX, pageY } = event
  const elementFromPoint = document.elementFromPoint(pageX, pageY)
  const isIntersectingTop = elementFromPoint?.classList.contains('top')

  // Set the previous and next panel elements [because we need to resize them]
  if (splitterEl.value?.parentElement?.classList.contains('splitter-panel')) {
    parentPanelEl.value = splitterEl.value?.parentElement

    // Identify previous parent panel respect to the intersection
    prevParentPanelEl.value =
      parentPanelEl.value?.previousElementSibling?.previousElementSibling?.classList.contains(
        'splitter-panel'
      )
        ? (parentPanelEl.value?.previousElementSibling
            .previousElementSibling as HTMLElement)
        : parentPanelEl.value

    // Identify next parent panel respect to the intersection
    nextParentPanelEl.value =
      parentPanelEl.value?.nextElementSibling?.nextElementSibling?.classList.contains(
        'splitter-panel'
      )
        ? (parentPanelEl.value?.nextElementSibling
            .nextElementSibling as HTMLElement)
        : parentPanelEl.value

    /**
     * If both previous and next parent panels exists, we need to check which one is intersecting
     *  according to the intersection point
     */
    if (prevParentPanelEl.value && nextParentPanelEl.value) {
      if (isIntersectingTop) {
        nextParentPanelEl.value = parentPanelEl.value
      } else {
        prevParentPanelEl.value = parentPanelEl.value
      }
    }

    // Setting the parent splitter that holds the panels for multidirectional resizing
    if (prevParentPanelEl.value?.parentElement) {
      multidirectionalParentSplitter.value =
        prevParentPanelEl.value.parentElement
    } else if (nextParentPanelEl.value?.parentElement) {
      multidirectionalParentSplitter.value =
        nextParentPanelEl.value.parentElement
    }
  }

  // Set the size of the splitter (that have panels inside it) - according to the layout
  if (multidirectionalParentSplitter.value) {
    multidirectionParentSplitterSize.value = intersectHorizontal.value
      ? multidirectionalParentSplitter.value.clientWidth
      : multidirectionalParentSplitter.value.clientHeight
  }

  // Set the start position according to the intersection point
  if (intersectHorizontal.value) {
    intersectStartPos.value = pageX
  } else {
    intersectStartPos.value = pageY
  }

  // Set the previous and next panel size [because we need to resize them]
  prevParentPanelSize.value =
    (100 *
      (intersectHorizontal.value
        ? getOuterWidth(prevParentPanelEl.value, true)
        : getOuterHeight(prevParentPanelEl.value, true))) /
    multidirectionParentSplitterSize.value

  // For the parent panel
  intersectionParentPanelSize.value =
    (100 *
      (intersectHorizontal.value
        ? getOuterWidth(parentPanelEl.value, true)
        : getOuterHeight(parentPanelEl.value, true))) /
    multidirectionParentSplitterSize.value

  // For the next panel
  nextParentPanelSize.value =
    (100 *
      (intersectHorizontal.value
        ? getOuterWidth(nextParentPanelEl.value, true)
        : getOuterHeight(nextParentPanelEl.value, true))) /
    multidirectionParentSplitterSize.value

  // Set the resizing state
  multidirectionalParentSplitter.value?.setAttribute('data-p-resizing', 'true')
}

function onResize(
  event: TouchEvent | MouseEvent,
  step: number = 20,
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
  } else if (event instanceof MouseEvent) {
    if (horizontal.value) {
      newPos =
        (event.pageX * 100) / size.value - (startPos.value * 100) / size.value
    } else {
      newPos =
        (event.pageY * 100) / size.value - (startPos.value * 100) / size.value
    }

    if (!isNil(newPos)) {
      newPrevPanelSize = prevPanelSize.value + newPos
      newNextPanelSize = nextPanelSize.value - newPos
    }

    if (isMultidirectionalResizing.value) {
      onMultidirectionResize(event)
    }
  }

  // Validate before resizing
  const prevPanelProps = panels.value[prevPanelIndex.value].props
  const nextPanelProps = panels.value[prevPanelIndex.value + 1].props
  console.log(panels.value[prevPanelIndex.value])
  const prevPanelMinSize = prevPanelProps
    ? prevPanelProps['min-size']
    : undefined

  const nextPanelMinSize = nextPanelProps
    ? nextPanelProps['min-size']
    : undefined

  const isValidResize = validatePanelReszie(
    newPrevPanelSize as number,
    newNextPanelSize as number,
    prevPanelMinSize,
    nextPanelMinSize
  )

  if (isValidResize) {
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

    emits('resize', { originalEvent: event })
  }

  // Handle collapsing
  // TODO: Default collapsed size optimization and emit event
  const isPrevPanelCollapsible = prevPanelProps && prevPanelProps.collapsible
  const isNextPanelCollapsible = nextPanelProps && nextPanelProps.collapsible

  if (
    isPrevPanelCollapsible &&
    newPrevPanelSize &&
    newPrevPanelSize < prevPanelMinSize
  ) {
    const collapsedSize = prevPanelProps['collapsed-size'] || 2

    if (prevPanelEl.value) {
      prevPanelEl.value.style.flexBasis = `calc(${collapsedSize}% - ${
        (panels.value.length - 1) * props.gutterSize
      }px)`
    }
  }

  if (
    isNextPanelCollapsible &&
    newNextPanelSize &&
    newNextPanelSize < nextPanelMinSize
  ) {
    const collapsedSize = nextPanelProps['collapsed-size'] || 2

    if (nextPanelEl.value) {
      nextPanelEl.value.style.flexBasis = `calc(${collapsedSize}% - ${
        (panels.value.length - 1) * props.gutterSize
      }px)`
    }
  }
}

function onMultidirectionResize(event: MouseEvent) {
  let newIntersectPos, newPrevParentPanelSize, newNextParentPanelSize

  // Setting panels sizes and intersection points
  if (intersectHorizontal.value) {
    newIntersectPos =
      (event.pageX * 100) / multidirectionParentSplitterSize.value -
      (intersectStartPos.value * 100) / multidirectionParentSplitterSize.value
  } else {
    newIntersectPos =
      (event.pageY * 100) / multidirectionParentSplitterSize.value -
      (intersectStartPos.value * 100) / multidirectionParentSplitterSize.value
  }

  if (!isNil(newIntersectPos)) {
    newPrevParentPanelSize = prevParentPanelSize.value + newIntersectPos
    newNextParentPanelSize = nextParentPanelSize.value - newIntersectPos
  }
  // Validate and resize the panels
  // @ts-expect-error DOM attribute
  const prevPanelMinSize = prevParentPanelEl.value?.getPanelMinSize()
  // @ts-expect-error DOM attribute
  const nextPanelMinSize = nextParentPanelEl.value?.getPanelMinSize()

  const isValidResize = validatePanelReszie(
    newPrevParentPanelSize as number,
    newNextParentPanelSize as number,
    prevPanelMinSize,
    nextPanelMinSize
  )

  if (isValidResize) {
    if (prevParentPanelEl.value && nextParentPanelEl.value) {
      prevParentPanelEl.value.style.flexBasis = `calc(${newPrevParentPanelSize}% -
          ${(panels.value.length - 1) * props.gutterSize}px)`

      nextParentPanelEl.value.style.flexBasis = `calc(${newNextParentPanelSize}% -
          ${(panels.value.length - 1) * props.gutterSize}px)`
    }
  }

  // TODO: Handle collapsing
  // TODO: Emit event
  // @ts-expect-error DOM attribute
  const isPrevPanelCollapsible = prevParentPanelEl.value?.isCollapsiblePanel()
  // @ts-expect-error DOM attribute
  const isNextPanelCollapsible = nextParentPanelEl.value?.isCollapsiblePanel()

  if (
    isPrevPanelCollapsible &&
    newPrevParentPanelSize &&
    newPrevParentPanelSize < prevPanelMinSize
  ) {
    // @ts-expect-error DOM attribute
    const collapsedSize = prevParentPanelEl.value?.getCollapsedSize() || 2

    if (prevParentPanelEl.value) {
      prevParentPanelEl.value.style.flexBasis = `calc(${collapsedSize}% - ${
        (panels.value.length - 1) * props.gutterSize
      }px)`
    }
  }

  if (
    isNextPanelCollapsible &&
    newNextParentPanelSize &&
    newNextParentPanelSize < nextPanelMinSize
  ) {
    // @ts-expect-error DOM attribute
    const collapsedSize = nextParentPanelEl.value?.getCollapsedSize() || 2

    if (nextParentPanelEl.value) {
      nextParentPanelEl.value.style.flexBasis = `calc(${collapsedSize}% - ${
        (panels.value.length - 1) * props.gutterSize
      }px)`
    }
  }
}

function onResizeEnd(event: TouchEvent | MouseEvent) {
  // TODO: State management (local storage)
  emits('resizeend', { originalEvent: event })

  gutterEls.value?.forEach(gutter =>
    gutter.setAttribute('data-p-gutter-resizing', 'false')
  )

  splitterEl.value?.setAttribute('data-p-resizing', 'false')

  // For multidirectional resizing
  if (isMultidirectionalResizing.value) {
    multidirectionalParentSplitter.value?.setAttribute(
      'data-p-resizing',
      'false'
    )

    isMultidirectionalResizing.value = false
  }

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

function hasIntersectingTopGutter(): boolean {
  const mainParentOfSplitter = splitterEl.value?.parentElement
  const previousSibiling = mainParentOfSplitter?.previousElementSibling

  if (previousSibiling?.classList.contains('splitter-gutter')) {
    return true
  }

  return false
}

function hasIntersectingBottomGutter(): boolean {
  const mainParentOfSplitter = splitterEl.value?.parentElement
  const nextSibiling = mainParentOfSplitter?.nextElementSibling

  if (nextSibiling?.classList.contains('splitter-gutter')) {
    return true
  }

  return false
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
onMounted(() => {
  // TODO: State management (local storage) (if needed)
  if (panels.value && panels.value.length) {
    const initialized = false

    if (!initialized) {
      if (splitterEl.value) {
        // Get all current splitter panels of the main splitter
        const children = [...splitterEl.value.children].filter(child =>
          (child as HTMLElement).classList.contains('splitter-panel')
        ) as HTMLElement[]

        const _panelSizes: number[] = []
        /**
         * - Setting the size of each panel
         * - If the panel has a size prop, we use it
         * - Otherwise, we set the size of each panel to 100 / number of panels, because we want to make them equal
         */
        panels.value.forEach((panel, i) => {
          const panelInitialSize =
            panel.props && panel.props.size ? panel.props.size : null

          const panelSize = panelInitialSize || 100 / panels.value.length

          _panelSizes[i] = panelSize
          children[i].style.flexBasis = `calc(${panelSize}% - ${
            (panels.value.length - 1) * props.gutterSize
          }px)`
        })

        panelSizes.value = _panelSizes
        prevSize.value = Number.parseFloat(_panelSizes[0].toString()).toFixed(4)
      }
    }
  }
})

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
        ref="gutterEls"
        role="separator"
        tabindex="-1"
        class="splitter-gutter"
        :data-p-gutter-resizing="false"
        @mousedown="onGutterMouseDown($event, i)"
      >
        <!-- Intersection points [Top and bottom] (multi-directional resizing) -->
        <div
          v-if="hasIntersectingTopGutter()"
          :class="gutterHandlerTopInterSectionClasses"
        />

        <div
          v-if="hasIntersectingBottomGutter()"
          :class="gutterHandlerBottomInterSectionClasses"
        />

        <!-- Gutter hnadler -->
        <div
          class="splitter-gutter-handle"
          tabindex="0"
          :style="[gutterStyle]"
        >
          <!-- Gutter hover arrows hint -->
          <template v-if="!ui?.noResizeArrowHint">
            <div :class="gutterHandlerCollapsePreviousClasses" />

            <div :class="gutterHandlerCollapseNextClasses" />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.splitter {
  --apply: flex flex-row flex-nowrap;
}

.splitter-vertical {
  --apply: flex flex-col;
}

.splitter-gutter {
  --apply: relative flex shrink-0 flex-grow-0 items-center justify-center
    cursor-col-resize transition-all duration-0.25s pointer-events-auto;

  &:hover {
    --apply: ;
  }
}

.splitter-gutter-handle {
  --apply: relative;
}

.splitter-horizontal.splitter-resizing {
  --apply: cursor-col-resize select-none;
}

.splitter-horizontal > .splitter-gutter > .splitter-gutter-handle {
  --apply: w-full h-6;
}

.splitter-horizontal > .splitter-gutter {
  --apply: cursor-col-resize;

  .splitter-gutter-handle-previous,
  .splitter-gutter-handle-next {
    --apply: invisible opacity-0;
    transition: visibility 0s, opacity 0.5s linear;
  }

  &:hover {
    .splitter-gutter-handle-previous {
      --apply: absolute top-0.5 left-2;
      visibility: visible;
      opacity: 0.7;
    }

    .splitter-gutter-handle-next {
      --apply: absolute bottom-0.5 right-2;
      visibility: visible;
      opacity: 0.7;
    }
  }
}

.splitter-vertical > .splitter-gutter {
  --apply: cursor-row-resize;

  .splitter-gutter-handle-previous,
  .splitter-gutter-handle-next {
    --apply: invisible opacity-0;
    transition: visibility 0s, opacity 0.5s linear;
  }

  &:hover {
    .splitter-gutter-handle-previous {
      --apply: absolute top-2 left-0.5;
      visibility: visible;
      opacity: 0.7;
    }

    .splitter-gutter-handle-next {
      --apply: absolute bottom-2 right-0.5;
      visibility: visible;
      opacity: 0.7;
    }
  }
}

.splitter-gutter-intersection {
  --apply: absolute w-3 h-3 z-2 cursor-move;
}

.splitter-vertical.splitter-resizing {
  --apply: cursor-row-resize select-none;
}

.splitter-vertical > .splitter-gutter {
  --apply: cursor-row-resize w-full;
}

.splitter-vertical > .splitter-gutter > .splitter-gutter-handle {
  --apply: h-full w-6;
}
</style>
