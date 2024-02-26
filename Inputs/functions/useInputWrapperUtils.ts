// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export function useInputWrapperUtils() {
  function getInputWrapperProps(props: IInputWrapperProps) {
    return reactivePick(
      props,
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
      styleVariables['--lineHeight'] = '24px'
      styleVariables['--padding'] = '0 12px'
      styleVariables['--margin'] = '4px 0'

      if (isLabelInside) {
        styleVariables['--padding'] = '0 12px'
        styleVariables['--margin'] = '16px 0 4px'

        if (!hasLabel) {
          styleVariables['--margin'] = '10px 0'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '0px 12px'
        styleVariables['--margin'] = '4px 0px'

        if (!hasLabel) {
          styleVariables['--margin'] = '4px 0'
        }
      }
    }

    // Size: md
    else if (props.size === 'md') {
      styleVariables['--fontSize'] = '16px'
      styleVariables['--lineHeight'] = '26px'
      styleVariables['--padding'] = '0px 12px'
      styleVariables['--margin'] = '7px 0'

      if (isLabelInside) {
        styleVariables['--padding'] = '0 12px'
        styleVariables['--margin'] = '19px 0 3px'

        if (!hasLabel) {
          styleVariables['--margin'] = '11px 0'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '1px 12px'
        styleVariables['--margin'] = '6px 0'

        if (!hasLabel) {
          styleVariables['--margin'] = '6px 0'
        }
      }
    }

    // Size: lg
    else if (props.size === 'lg') {
      styleVariables['--fontSize'] = '18px'
      styleVariables['--lineHeight'] = '28px'
      styleVariables['--padding'] = '4px 10px'
      styleVariables['--margin'] = '6px 0'

      if (isLabelInside) {
        styleVariables['--padding'] = '0 12px'
        styleVariables['--margin'] = '20px 0 6px'

        if (!hasLabel) {
          styleVariables['--margin'] = '13px 12px'
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = '2px 12px'
        styleVariables['--margin'] = '8px 0'

        if (!hasLabel) {
          styleVariables['--margin'] = '8px 0'
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
