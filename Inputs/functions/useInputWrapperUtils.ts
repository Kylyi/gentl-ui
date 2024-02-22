// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export function useInputWrapperUtils() {
  function getInputWrapperProps(props: IInputWrapperProps) {
    return reactivePick(
      props,
      'contentClass',
      'contentStyle',
      'disabled',
      'errorTakesSpace',
      'errorVisible',
      'hint',
      'label',
      'labelStyle',
      'labelClass',
      'layout',
      'loading',
      'modelValue',
      'originalValue',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel',
      'noBorder',
      'inputContainerClass',
      'inputContainerStyle',
      'validation',
      'ui',
      'zod'
    )
  }

  function getInputWrapperStyleVariables(props: IInputWrapperProps) {
    const styleVariables = {
      '--fontSize': '',
      '--labelFontSize': '',
      '--lineHeight': '',
      '--padding': '',
      '--margin': '',
      '--bodyMargin': '',
      '--borderColor': props.ui?.borderColor || 'var(--color-primary)',
    }

    const isLabelInside = props.layout === 'label-inside'
    const isInline = props.layout === 'inline'
    const isRegular = props.layout === 'regular'
    const hasLabel = !!props.label

    // Size: sm
    if (props.size === 'sm') {
      styleVariables['--fontSize'] = '14px'
      styleVariables['--lineHeight'] = '16px'
      styleVariables['--padding'] = '8px 12px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '16px 12px 0'
        styleVariables['--margin'] = '0'

        if (!hasLabel) {
          styleVariables['--padding'] = '0 12px 0'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '24px 12px 8px'
      }
    }

    // Size: md
    else if (props.size === 'md') {
      styleVariables['--fontSize'] = '16px'
      styleVariables['--lineHeight'] = '24px'
      styleVariables['--padding'] = '8px 12px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '16px 12px 0'
        styleVariables['--margin'] = '0'

        if (!hasLabel) {
          styleVariables['--padding'] = '0 12px 0'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '24px 12px 8px'
      }
    }

    // Size: lg
    else if (props.size === 'lg') {
      styleVariables['--fontSize'] = '18px'
      styleVariables['--lineHeight'] = '28px'
      styleVariables['--padding'] = '10px 10px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '18px 12px 0'
        styleVariables['--margin'] = '0'

        if (!hasLabel) {
          styleVariables['--padding'] = '0 12px 0'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '30px 12px 8px'
      }
    }

    return styleVariables
  }

  return {
    getInputWrapperProps,
    getInputWrapperStyleVariables,
  }
}
