// TYPES;
import type { ISectionProps } from '~/components/Section/types/section-props.type'

export function useSectionUtils() {
  function getSectionProps(props: ISectionProps) {
    return reactivePick(props, [
      'bordered',
      'dense',
      'sectionClass',
      'subtitle',
      'subtitleClass',
      'title',
      'titleClass',
      'titleFilled',
    ])
  }

  return {
    getSectionProps,
  }
}
