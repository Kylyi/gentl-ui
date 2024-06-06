// Types
import { type CSSProperties } from 'vue'
import type { ISplitterProps } from '~/components/Splitter/types/splitter.type'

export function useSplitterLayout(props: ISplitterProps) {
  // Layout
  const horizontal = computed(() => props.layout === 'horizontal')
  const intersectHorizontal = computed(() => !horizontal.value)

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

  const gutterHandlerInterSectionClasses = computed(() => [
    'splitter-gutter-intersection',
    { 'top-[-7px]': horizontal.value },
    { 'left-[-7px]': !horizontal.value },
  ])

  return {
    // Layout
    horizontal,
    intersectHorizontal,

    // Styling and classes
    splitterClasses,
    gutterStyle,
    gutterHandlerCollapsePreviousClasses,
    gutterHandlerCollapseNextClasses,
    gutterHandlerInterSectionClasses,
  }
}
