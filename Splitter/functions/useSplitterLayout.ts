// @unocss-include
// Types
import { type CSSProperties } from 'vue'
import type { ISplitterProps } from '~/components/Splitter/types/splitter.type'

export function useSplitterLayout(props: ISplitterProps) {
  // Layout
  const horizontal = computed(() => props.layout === 'horizontal')
  const intersectHorizontal = computed(() => !horizontal.value)

  // Functions
  function isIntersectionArea(event: MouseEvent) {
    const elementFromPoint = document.elementFromPoint(event.pageX, event.pageY)
    const isIntersectionEl = elementFromPoint?.classList.contains(
      'splitter-gutter-intersection'
    )

    if (isIntersectionEl) {
      return true
    }

    return false
  }

  function getNewPanelFlexBasisSize(
    newPanelSize: number,
    panelsLength: number
  ) {
    return `calc(${newPanelSize}% - ${
      (panelsLength - 1) * (props.gutterSize as number)
    }px)`
  }

  /**
   * The function returns the new mouse position in percentage according to the container & layout and the start position
   * @param event - The MouseEvent triggered by the user's interaction
   * @param startPos - The initial position of the mouse when the interaction started
   * @param containerSize - The size of the container within which the mouse is moving
   * @param horizontal - A boolean indicating if the container is horizontal
   * @returns delta - The change in mouse position as a percentage of the container size
   */
  function getNewInnerMousePosition(
    event: MouseEvent,
    startPos: number,
    containerSize: number,
    horizontal: boolean
  ): number {
    const mouseInnerPosition = horizontal
      ? (event.clientX * 100) / containerSize
      : (event.clientY * 100) / containerSize

    const mouseInnerStartPos = (startPos * 100) / containerSize
    const delta = mouseInnerPosition - mouseInnerStartPos

    return delta
  }

  // Styling and classes
  const splitterClasses = computed(() => {
    return ['splitter', `splitter-${props.layout}`]
  })

  const gutterStyle = computed<CSSProperties>(() => ({
    [horizontal.value ? 'width' : 'height']: `${props.gutterSize}px`,
  }))

  const gutterHandlerCollapsePreviousClasses = computed(() => [
    'splitter-gutter-handle-previous color-ca',
    { 'i-mdi:arrow-down ': !horizontal.value },
    {
      'i-material-symbols:arrow-forward-rounded': horizontal.value,
    },
  ])

  const gutterHandlerCollapseNextClasses = computed(() => [
    'splitter-gutter-handle-next color-ca',
    { 'i-mdi:arrow-up': !horizontal.value },
    {
      'i-material-symbols:arrow-back-rounded': horizontal.value,
    },
  ])

  const gutterHandlerTopInterSectionClasses = computed(() => [
    'splitter-gutter-intersection top',
    { 'top-[-7px]': horizontal.value },
    { 'left-[-7px]': !horizontal.value },
  ])

  const gutterHandlerBottomInterSectionClasses = computed(() => [
    'splitter-gutter-intersection bottom',
    { 'bottom-[-7px]': horizontal.value },
    { 'left-[-7px]': !horizontal.value },
  ])

  return {
    // Layout
    horizontal,
    intersectHorizontal,

    // Functions
    isIntersectionArea,
    getNewPanelFlexBasisSize,
    getNewInnerMousePosition,

    // Styling and classes
    splitterClasses,
    gutterStyle,
    gutterHandlerCollapsePreviousClasses,
    gutterHandlerCollapseNextClasses,
    gutterHandlerTopInterSectionClasses,
    gutterHandlerBottomInterSectionClasses,
  }
}
