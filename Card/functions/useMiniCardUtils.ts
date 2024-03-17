// Types
import { type IMiniCardProps } from '~/components/Card/types/mini-card-props.type'

export function useMiniCardUtils() {
  function getMiniCardProps(props: IMiniCardProps) {
    return reactivePick(props, [
      'label',
      'labelClass',
      'valueClass',
      'value',
      'dataType',
      'format',
      'emptyValueString',
      'emptyValue',
      'to',
      'icon',
      'row',
      'previousValue',
      'previousValueClass',
      'toPreviousValue',
      'originalValue',
      'valueStyle',
      'valueClass',
    ])
  }

  return {
    getMiniCardProps,
  }
}
