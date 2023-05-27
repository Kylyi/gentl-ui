// TYPES
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export function useInputWrapperUtils() {
  function getInputWrapperProps(props: IInputWrapperProps) {
    reactivePick(
      props,
      'contentClass',
      'disabled',
      'errors',
      'errorTakesSpace',
      'errorVisible',
      'hint',
      'inline',
      'label',
      'labelClass',
      'labelInside',
      'loading',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel'
    )
  }

  return {
    getInputWrapperProps,
  }
}
