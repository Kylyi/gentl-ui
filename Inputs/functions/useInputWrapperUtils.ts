// Types
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

  function getInputWrapperStyleVariables(props: IInputWrapperProps) {
    const styleVariables = {
      '--fontSize': '',
      '--lineHeight': '',
      '--padding': '',
      '--margin': '',
      '--bodyMargin': '',
    }

    const isLabelInside = props.labelInside
    const isInline = props.inline
    const hasLabel = !!props.label

    // Size: sm
    if (props.size === 'sm') {
      styleVariables['--fontSize'] = '14px'
      styleVariables['--lineHeight'] = '16px'
      styleVariables['--padding'] = '8px 12px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '0 12px 4px'
        styleVariables['--margin'] = '16px 0 0 0'

        if (!hasLabel) {
          styleVariables['--margin'] = '10px 0'
        }
      }

      if (!isLabelInside && !isInline && hasLabel) {
        styleVariables['--bodyMargin'] = '14px 0 0 0'
      }
    }

    // Size: md
    else if (props.size === 'md') {
      styleVariables['--fontSize'] = '16px'
      styleVariables['--lineHeight'] = '24px'
      styleVariables['--padding'] = '8px 12px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '0 12px'
        styleVariables['--margin'] = '17px 0 3px 0'

        if (!hasLabel) {
          styleVariables['--margin'] = '12px 0'
        }
      }

      if (!isLabelInside && !isInline && hasLabel) {
        styleVariables['--bodyMargin'] = '18px 0 0 0'
      }
    }

    // Size: lg
    else if (props.size === 'lg') {
      styleVariables['--fontSize'] = '18px'
      styleVariables['--lineHeight'] = '28px'
      styleVariables['--padding'] = '12px 12px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '0 12px'
        styleVariables['--margin'] = '20px 0 4px 0'

        if (!hasLabel) {
          styleVariables['--margin'] = '14px 0'
        }
      }

      if (!isLabelInside && !isInline && hasLabel) {
        styleVariables['--bodyMargin'] = '22px 0 0 0'
      }
    }

    return styleVariables
  }

  return {
    getInputWrapperProps,
    getInputWrapperStyleVariables,
  }
}
