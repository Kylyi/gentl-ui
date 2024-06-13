<script setup lang="ts">
// Types
import type {
  ISplitterEmit,
  ISplitterProps,
} from '~/components/Splitter/types/splitter.type'
import type { ISplitterPanelProps } from '~/components/Splitter/types/splitter-panel.type'

// Components
import SplitterPanel from '~/components/Splitter/SplitterPanel.vue'

// Injections
import { registerPanelPropsKey } from '~/components/Splitter/provide/splitter.provide'

// Utils
import { useDomUtils } from '~/components/Splitter/functions/useDomUtils'
import { useSplitterUtils } from '~/components/Splitter/functions/useSplitterUtils'
import { useSplitterLayout } from '~/components/Splitter/functions/useSplitterLayout'
import { useSplitterPanelUtils } from '~/components/Splitter/functions/useSplitterPanelUtils'

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
const { getOuterHeight, getOuterWidth, getWidth, getHeight } = useDomUtils()
const { validatePanelReszie } = useSplitterUtils()
const {
  horizontal,
  intersectHorizontal,
  getNewPanelFlexBasisSize,
  isIntersectionArea,
  getNewInnerMouseOrTouchPosition,
  gutterHandlerCollapseNextClasses,
  gutterHandlerCollapsePreviousClasses,
  gutterHandlerBottomInterSectionClasses,
  gutterHandlerTopInterSectionClasses,
  gutterStyle,
  splitterClasses,
} = useSplitterLayout(props)
const { getPanelPropsFromDom } = useSplitterPanelUtils()

// Layout
provide(registerPanelPropsKey, (props: ISplitterPanelProps) =>
  panelsProps.value.push(props)
)

const panelsProps = ref<ISplitterPanelProps[]>([])
const panels = computed(() => {
  const panels: VNode[] = []

  slots.default?.().forEach((child: VNode) => {
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
const prevPanelIndex = ref<number>(0)
const panelSizes = ref<number[]>([])
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
const touchMoveListener = ref<(event: TouchEvent) => void>()
const touchEndListener = ref<(event: TouchEvent) => void>()

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
      ? getWidth(splitterEl.value)
      : getHeight(splitterEl.value)
  }

  // Set the start position and dragging state
  if (!isKeyDown) {
    dragging.value = true

    if (event instanceof MouseEvent) {
      startPos.value = horizontal.value ? event.pageX : event.pageY
    } else if (event instanceof TouchEvent) {
      startPos.value = horizontal.value
        ? event.changedTouches[0].pageX
        : event.changedTouches[0].pageY
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

function onResize(event: TouchEvent | MouseEvent, isKeyDown?: boolean) {
  let newPrevPanelSize, newNextPanelSize

  // Keybord resizing
  if (isKeyDown) {
    if (horizontal.value) {
      newPrevPanelSize =
        (100 * (prevPanelSize?.value + props.step)) / size.value
      newNextPanelSize =
        (100 * (nextPanelSize?.value - props.step)) / size.value
    } else {
      newPrevPanelSize =
        (100 * (prevPanelSize?.value - props.step)) / size.value
      newNextPanelSize =
        (100 * (nextPanelSize?.value + props.step)) / size.value
    }
  } else {
    // Mouse and touch resizing
    if (event instanceof MouseEvent || event instanceof TouchEvent) {
      const newPos = getNewInnerMouseOrTouchPosition(
        event,
        startPos.value,
        size.value,
        horizontal.value
      )
      if (!isNil(newPos)) {
        newPrevPanelSize = prevPanelSize.value + newPos
        newNextPanelSize = nextPanelSize.value - newPos
      }

      // Multidirectional resizing (applicable only for mouse events)
      if (isMultidirectionalResizing.value && event instanceof MouseEvent) {
        onMultidirectionResize(event)
      }
    }
  }

  // Start of resizing/collapsing
  if (
    prevPanelEl.value &&
    nextPanelEl.value &&
    newPrevPanelSize &&
    newNextPanelSize
  ) {
    const prevPanelProps = panelsProps.value[prevPanelIndex.value]
    const nextPanelProps = panelsProps.value[prevPanelIndex.value + 1]

    const isValidResize = validatePanelReszie(
      newPrevPanelSize,
      newNextPanelSize,
      prevPanelProps.minSize,
      nextPanelProps.minSize
    )

    if (isValidResize) {
      // Resize the panels
      prevPanelEl.value.style.flexBasis = getNewPanelFlexBasisSize(
        newPrevPanelSize as number,
        panels.value.length
      )
      nextPanelEl.value.style.flexBasis = getNewPanelFlexBasisSize(
        newNextPanelSize as number,
        panels.value.length
      )

      panelSizes.value[prevPanelIndex.value] = newPrevPanelSize
      panelSizes.value[prevPanelIndex.value + 1] = newNextPanelSize
      prevSize.value = Number.parseFloat(newPrevPanelSize.toString()).toFixed(4)

      emits('resize', { originalEvent: event })
    } else {
      // Check and update collapsible panels only if the resizing is not valid
      checkAndUpdateCollapsiblePanels(
        event,
        {
          newPrevPanelSize,
          prevPanelProps,
          element: prevPanelEl.value,
        },
        {
          newNextPanelSize,
          nextPanelProps,
          element: nextPanelEl.value,
        }
      )
    }
  }
}

function onMultidirectionResize(event: MouseEvent) {
  let newPrevParentPanelSize, newNextParentPanelSize

  // Setting panels sizes and intersection points
  const newIntersectPos = getNewInnerMouseOrTouchPosition(
    event,
    intersectStartPos.value,
    multidirectionParentSplitterSize.value,
    intersectHorizontal.value
  )

  if (!isNil(newIntersectPos)) {
    newPrevParentPanelSize = prevParentPanelSize.value + newIntersectPos
    newNextParentPanelSize = nextParentPanelSize.value - newIntersectPos
  }

  // Start of resizing/collapsing
  if (
    prevParentPanelEl.value &&
    nextParentPanelEl.value &&
    newPrevParentPanelSize &&
    newNextParentPanelSize
  ) {
    const prevParentPanelProps = getPanelPropsFromDom(prevParentPanelEl.value)
    const nextParentPanelProps = getPanelPropsFromDom(nextParentPanelEl.value)

    const isValidResize = validatePanelReszie(
      newPrevParentPanelSize,
      newNextParentPanelSize,
      prevParentPanelProps.minSize,
      nextParentPanelProps.minSize
    )

    if (isValidResize) {
      // Resize the panels
      prevParentPanelEl.value.style.flexBasis = getNewPanelFlexBasisSize(
        newPrevParentPanelSize,
        panels.value.length
      )

      nextParentPanelEl.value.style.flexBasis = getNewPanelFlexBasisSize(
        newNextParentPanelSize,
        panels.value.length
      )
    } else {
      // Check and update collapsible panels
      checkAndUpdateCollapsiblePanels(
        event,
        {
          newPrevPanelSize: newPrevParentPanelSize,
          prevPanelProps: prevParentPanelProps,
          element: prevParentPanelEl.value!,
        },
        {
          newNextPanelSize: newNextParentPanelSize,
          nextPanelProps: nextParentPanelProps,
          element: nextParentPanelEl.value!,
        }
      )
    }
  }
}

function onResizeEnd(event: TouchEvent | MouseEvent) {
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

function onGutterTouchStart(event: TouchEvent, index: number) {
  onResizeStart(event, index)
  bindTouchListeners()
  event.preventDefault()
}

function onGutterTouchMove(event: TouchEvent) {
  console.log('Touch move')
  onResize(event)
  event.preventDefault()
}

function onGutterTouchEnd(event: TouchEvent) {
  onResizeEnd(event)
  unbindTouchListeners()
  event.preventDefault()
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

function bindTouchListeners() {
  if (!touchMoveListener.value) {
    touchMoveListener.value = (event: TouchEvent) => onResize(event)
    document.addEventListener('touchmove', touchMoveListener.value)
  }

  if (!touchEndListener.value) {
    touchEndListener.value = (event: TouchEvent) => {
      onResizeEnd(event)
      unbindTouchListeners()
    }

    document.addEventListener('touchend', touchEndListener.value)
  }
}

function unbindTouchListeners() {
  if (touchMoveListener.value) {
    document.removeEventListener('touchmove', touchMoveListener.value)
    touchMoveListener.value = undefined
  }

  if (touchEndListener.value) {
    document.removeEventListener('touchend', touchEndListener.value)
    touchEndListener.value = undefined
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

function checkAndUpdateCollapsiblePanels(
  event: MouseEvent | TouchEvent,
  prevPanelOptions: {
    newPrevPanelSize: number
    prevPanelProps: ISplitterPanelProps
    element: HTMLElement
  },
  nextPanelOptions: {
    newNextPanelSize: number
    nextPanelProps: ISplitterPanelProps
    element: HTMLElement
  }
) {
  const {
    newPrevPanelSize,
    prevPanelProps,
    element: prevPanelEl,
  } = prevPanelOptions

  const {
    newNextPanelSize,
    nextPanelProps,
    element: nextPanelEl,
  } = nextPanelOptions

  // Previous panel
  if (
    prevPanelProps.collapsible &&
    prevPanelProps.minSize &&
    newPrevPanelSize < prevPanelProps.minSize
  ) {
    if (prevPanelEl) {
      prevPanelEl.style.flexBasis = getNewPanelFlexBasisSize(
        prevPanelProps.collapsedSize!,
        panels.value.length
      )
      emits('collapse', { originalEvent: event })
    }
  }

  // Next panel
  if (
    nextPanelProps.collapsible &&
    nextPanelProps.minSize &&
    newNextPanelSize < nextPanelProps.minSize
  ) {
    if (nextPanelEl) {
      nextPanelEl.style.flexBasis = getNewPanelFlexBasisSize(
        nextPanelProps.collapsedSize!,
        panels.value.length
      )

      emits('collapse', { originalEvent: event })
    }
  }
}

function clear() {
  // Clear dragging state
  dragging.value = false

  // Clear size
  size.value = 0
  prevSize.value = '0'
  multidirectionParentSplitterSize.value = 0

  // Clear start position
  startPos.value = 0
  intersectStartPos.value = 0

  // Clear [previous, next] panel
  prevPanelEl.value = undefined
  nextPanelEl.value = undefined
  prevParentPanelEl.value = undefined
  nextParentPanelEl.value = undefined

  // Clear [previous, next] panel size
  prevPanelSize.value = 0
  nextPanelSize.value = 0
  prevParentPanelSize.value = 0
  nextParentPanelSize.value = 0

  // Clear gutter element
  gutterElement.value = undefined

  // Clear previous panel index
  prevPanelIndex.value = 0
}

// Lifecycle
onMounted(() => {
  if (panels.value && panels.value.length) {
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
        children[i].style.flexBasis = getNewPanelFlexBasisSize(
          panelSize,
          panels.value.length
        )
      })

      panelSizes.value = _panelSizes
      prevSize.value = Number.parseFloat(_panelSizes[0].toString()).toFixed(4)
    }
  }
})

onBeforeUnmount(() => {
  clear()
  unbindMouseListeners()
})
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
        @touchstart="onGutterTouchStart($event, i)"
        @touchmove="onGutterTouchMove"
        @touchcancel="onGutterTouchEnd"
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
  @apply flex flex-row flex-nowrap;
}

.splitter-vertical {
  @apply flex flex-col;
}

.splitter-gutter {
  @apply relative flex shrink-0 flex-grow-0 items-center justify-center
    cursor-col-resize transition-all duration-0.25s pointer-events-auto;

  &:hover {
    @apply;
  }
}

.splitter-gutter-handle {
  @apply relative;
}

.splitter-horizontal.splitter-resizing {
  @apply cursor-col-resize select-none;
}

.splitter-horizontal > .splitter-gutter > .splitter-gutter-handle {
  @apply w-full h-6;
}

.splitter-horizontal > .splitter-gutter {
  @apply cursor-col-resize;

  .splitter-gutter-handle-previous,
  .splitter-gutter-handle-next {
    @apply invisible opacity-0;
    transition: visibility 0s, opacity 0.5s linear;
  }

  &:hover {
    .splitter-gutter-handle-previous {
      @apply absolute top-0.5 left-2;
      visibility: visible;
      opacity: 0.7;
    }

    .splitter-gutter-handle-next {
      @apply absolute bottom-0.5 right-2;
      visibility: visible;
      opacity: 0.7;
    }
  }
}

.splitter-vertical > .splitter-gutter {
  @apply cursor-row-resize;

  .splitter-gutter-handle-previous,
  .splitter-gutter-handle-next {
    @apply invisible opacity-0;
    transition: visibility 0s, opacity 0.5s linear;
  }

  &:hover {
    .splitter-gutter-handle-previous {
      @apply absolute top-2 left-0.5;
      visibility: visible;
      opacity: 0.7;
    }

    .splitter-gutter-handle-next {
      @apply absolute bottom-2 right-0.5;
      visibility: visible;
      opacity: 0.7;
    }
  }
}

.splitter-gutter-intersection {
  @apply absolute w-3 h-3 z-2 cursor-move;
}

.splitter-vertical.splitter-resizing {
  @apply cursor-row-resize select-none;
}

.splitter-vertical > .splitter-gutter {
  @apply cursor-row-resize w-full;
}

.splitter-vertical > .splitter-gutter > .splitter-gutter-handle {
  @apply h-full w-6;
}
</style>
