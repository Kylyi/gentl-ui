// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export function useInputWrapperUtils() {
  function getInputWrapperProps(props: IInputWrapperProps) {
    reactivePick(
      props,
      'contentClass',
      'disabled',
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
      'stackLabel',
      'validation'
    )
  }

  function getInputWrapperStyleVariables(props: IInputWrapperProps) {
    const styleVariables = {
      '--fontSize': '',
      '--lineHeight': '',
      '--padding': '',
      '--margin': '',
      '--bodyMargin': '',
      '--border-color': props.ui?.borderColor || 'var(--color-primary)',
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

      if (props.noBorder) {
        styleVariables['--padding'] = '8px 8px'
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

      if (props.noBorder) {
        styleVariables['--padding'] = '8px 8px'
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

      if (props.noBorder) {
        styleVariables['--padding'] = '8px 8px'
      }
    }

    return styleVariables
  }

  return {
    getInputWrapperProps,
    getInputWrapperStyleVariables,
  }
}
