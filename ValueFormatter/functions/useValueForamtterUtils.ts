import { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

export function useValueFormatterUtils() {
  function getValueFormatterProps(props: IValueFormatter) {
    return reactivePick(props, [
      'value',
      'dataType',
      'format',
      'emptyValueString',
      'row',
    ])
  }

  return {
    getValueFormatterProps,
  }
}
