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
    const isRegular = props.layout === 'regular'
    const hasLabel = !!props.label

    // Size: sm
    if (props.size === 'sm') {
      styleVariables['--fontSize'] = '14px'
      styleVariables['--lineHeight'] = '16px'
      styleVariables['--padding'] = '8px 12px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '16px 12px 4px'
        styleVariables['--margin'] = '0'

        if (!hasLabel) {
          styleVariables['--padding'] = '0 12px 0'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '24px 12px 7.5px'

        if (!hasLabel) {
          styleVariables['--padding'] = '8px 12px'
        }
      }
    }

    // Size: md
    else if (props.size === 'md') {
      styleVariables['--fontSize'] = '16px'
      styleVariables['--lineHeight'] = '24px'
      styleVariables['--padding'] = '8px 12px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '20px 10px 2px'

        if (!hasLabel) {
          styleVariables['--padding'] = '0 12px 0'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '9px 12px 7px'

        if (!hasLabel) {
          styleVariables['--padding'] = '8px 12px'
        }
      }
    }

    // Size: lg
    else if (props.size === 'lg') {
      styleVariables['--fontSize'] = '18px'
      styleVariables['--lineHeight'] = '28px'
      styleVariables['--padding'] = '10px 10px'
      styleVariables['--margin'] = '0'

      if (isLabelInside) {
        styleVariables['--padding'] = '20px 12px 0'
        styleVariables['--margin'] = '0'

        if (!hasLabel) {
          styleVariables['--padding'] = '0 12px 0'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '29px 12px 11px'

        if (!hasLabel) {
          styleVariables['--padding'] = '10px 12px'
        }
      }
    }

    return styleVariables
  }

  return {
    getInputWrapperProps,
    getInputWrapperStyleVariables,
  }
}
