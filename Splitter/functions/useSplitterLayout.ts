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

    // Styling and classes
    splitterClasses,
    gutterStyle,
    gutterHandlerCollapsePreviousClasses,
    gutterHandlerCollapseNextClasses,
    gutterHandlerTopInterSectionClasses,
    gutterHandlerBottomInterSectionClasses,
  }
}
