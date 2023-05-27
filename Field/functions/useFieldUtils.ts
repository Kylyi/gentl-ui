// TYPE
import type { IFieldProps } from '~~/components/Field/types/field-props.type'

export function useFieldUtils() {
  function getFieldProps(props: IFieldProps) {
    return reactivePick(props, [
      'contentClass',
      'cursor',
      'disabled',
      'errorTakesSpace',
      'errorVisible',
      'errors',
      'hint',
      'inline',
      'label',
      'labelClass',
      'labelStyle',
      'labelInside',
      'loading',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel',
    ])
  }

  return { getFieldProps }
}
