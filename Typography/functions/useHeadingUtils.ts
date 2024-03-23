import type { IHeadingProps } from '~/components/Typography/types/heading-props.type'

export function useHeadingUtils() {
  function getHeadingProps(props: IHeadingProps) {
    return reactivePick(props, ['filled', 'highlighted'])
  }

  return { getHeadingProps }
}
